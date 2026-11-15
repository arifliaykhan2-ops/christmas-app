import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Accent, Button, Card, Chip, Field, H1, H2, Icon, P, Scene, haptic } from '@/components/ui';
import { formatMoney, strings, useI18nVersion } from '@/i18n';
import { uid, useStored } from '@/lib/storage';
import { colors, fonts, weights } from '@/lib/theme';

type Status = 'idea' | 'bought' | 'wrapped';
type Gift = { id: string; title: string; price: number; status: Status };
type Recipient = { id: string; name: string; budget: number; gifts: Gift[] };

const NEXT: Record<Status, Status> = { idea: 'bought', bought: 'wrapped', wrapped: 'idea' };
const parseMoney = (v: string) => Math.max(0, Number(v.replace(',', '.').replace(/[^0-9.]/g, '')) || 0);

export default function GiftsScreen() {
  const s = strings.gifts;
  useI18nVersion(); // re-render when the currency changes
  const [people, setPeople] = useStored<Recipient[]>('gifts', []);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  const spent = people.reduce((sum, p) => sum + p.gifts.filter((g) => g.status !== 'idea').reduce((a, g) => a + g.price, 0), 0);
  const total = people.reduce((sum, p) => sum + p.budget, 0);

  function addPerson() {
    if (!name.trim()) return;
    haptic.tap();
    setPeople((prev) => [...prev, { id: uid(), name: name.trim().slice(0, 30), budget: parseMoney(budget), gifts: [] }]);
    setName('');
    setBudget('');
  }

  const update = (id: string, fn: (p: Recipient) => Recipient) => setPeople((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));

  return (
    <Scene>
      <View style={st.head}>
        <View style={{ flex: 1, gap: 4 }}>
          <H1>{s.title}</H1>
          <Accent>{formatMoney(spent)}{total ? ` / ${formatMoney(total)}` : ''}</Accent>
        </View>
        <Icon name="bags" size={96} float />
      </View>

      <Card inner={st.summary}>
        <Stat label={s.total} value={formatMoney(total, true)} />
        <Stat label={s.spent} value={formatMoney(spent, true)} />
        <Stat label={s.left} value={formatMoney(total - spent, true)} warn={total > 0 && spent > total} />
      </Card>

      {people.length === 0 && (
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}>
          <Icon name="gift" size={90} />
          <P muted center>{s.empty}</P>
        </View>
      )}

      {people.map((p) => (
        <PersonCard key={p.id} person={p} onChange={(fn) => update(p.id, fn)} onDelete={() => setPeople((prev) => prev.filter((x) => x.id !== p.id))} />
      ))}

      <Card>
        <H2>{s.addPerson}</H2>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field style={{ flex: 2 }} placeholder={s.name} value={name} onChangeText={setName} />
          <Field style={{ flex: 1 }} placeholder={s.budget} value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />
        </View>
        <Button title={strings.common.add} chevrons onPress={addPerson} disabled={!name.trim()} />
      </Card>
    </Scene>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={[st.statValue, warn && { color: colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

function PersonCard({ person, onChange, onDelete }: { person: Recipient; onChange: (fn: (p: Recipient) => Recipient) => void; onDelete: () => void }) {
  const s = strings.gifts;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const spent = person.gifts.filter((g) => g.status !== 'idea').reduce((a, g) => a + g.price, 0);
  const label: Record<Status, string> = { idea: `💡 ${s.idea}`, bought: `🛍️ ${s.bought}`, wrapped: `🎁 ${s.wrapped}` };

  function addGift() {
    if (!title.trim()) return;
    haptic.tap();
    onChange((p) => ({ ...p, gifts: [...p.gifts, { id: uid(), title: title.trim().slice(0, 60), price: parseMoney(price), status: 'idea' }] }));
    setTitle('');
    setPrice('');
    setAdding(false);
  }

  function confirmDelete() {
    Alert.alert(person.name, undefined, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: strings.common.delete, style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <Card>
      <Pressable onLongPress={confirmDelete} style={st.personHead}>
        <H2 style={{ flex: 1 }}>{person.name}</H2>
        <Text style={[st.budget, person.budget > 0 && spent > person.budget && { color: colors.danger }]}>
          {formatMoney(spent)}
          {person.budget > 0 ? ` / ${formatMoney(person.budget)}` : ''}
        </Text>
      </Pressable>

      {person.gifts.length === 0 && <P muted style={{ fontSize: 14 }}>{s.noGifts}</P>}
      {person.gifts.map((g) => (
        <View key={g.id} style={st.giftRow}>
          <View style={{ flex: 1 }}>
            <Text style={[st.giftTitle, g.status === 'wrapped' && st.done]}>{g.title}</Text>
            {g.price > 0 && <Text style={st.giftPrice}>{formatMoney(g.price)}</Text>}
          </View>
          <Chip
            label={label[g.status]}
            on={g.status !== 'idea'}
            onPress={() => onChange((p) => ({ ...p, gifts: p.gifts.map((x) => (x.id === g.id ? { ...x, status: NEXT[x.status] } : x)) }))}
            style={{ paddingVertical: 7, paddingHorizontal: 12 }}
          />
          <Pressable
            hitSlop={10}
            accessibilityLabel={strings.common.delete}
            onPress={() => onChange((p) => ({ ...p, gifts: p.gifts.filter((x) => x.id !== g.id) }))}
          >
            <Text style={st.x}>×</Text>
          </Pressable>
        </View>
      ))}

      {adding ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field style={{ flex: 2 }} placeholder={s.gift} value={title} onChangeText={setTitle} autoFocus onSubmitEditing={addGift} />
            <Field style={{ flex: 1 }} placeholder={s.price} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          </View>
          <Button title={strings.common.save} onPress={addGift} disabled={!title.trim()} />
        </View>
      ) : (
        <Chip label={`＋  ${s.addGift}`} onPress={() => setAdding(true)} style={{ alignSelf: 'flex-start' }} />
      )}
    </Card>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summary: { flexDirection: 'row', gap: 8, paddingVertical: 16 },
  statValue: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 22 },
  statLabel: { color: colors.muted, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 13 },
  personHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budget: { color: colors.yellow, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 14 },
  giftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  giftTitle: { color: colors.white, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: colors.muted },
  giftPrice: { color: colors.muted, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 13 },
  x: { color: colors.muted, fontSize: 22, lineHeight: 24, paddingHorizontal: 2 },
});
