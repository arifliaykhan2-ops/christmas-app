import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Accent, Button, Card, Chip, Field, H1, H2, Icon, InfoTile, P, PersonRow, Scene, TextButton, haptic } from '@/components/ui';
import { fmt, strings, useI18nVersion } from '@/i18n';
import { drawNames, type Person, type Rule } from '@/lib/secretSanta';
import { uid, useStored } from '@/lib/storage';
import { colors, fonts, weights } from '@/lib/theme';

type SantaState = {
  people: Person[];
  rules: Rule[];
  budget: string;
  date: string;
  draw: Record<string, string> | null;
  seen: string[];
};

const EMPTY: SantaState = { people: [], rules: [], budget: '', date: '', draw: null, seen: [] };

export default function SantaScreen() {
  useI18nVersion();
  const [state, setState] = useStored<SantaState>('santa', EMPTY);
  return state.draw ? <Reveal state={state} setState={setState} /> : <Setup state={state} setState={setState} />;
}

type Props = { state: SantaState; setState: (s: SantaState | ((p: SantaState) => SantaState)) => void };

/** iOS text prompt (falls back to a no-op on web). */
function ask(title: string, current: string, onDone: (v: string) => void) {
  if (Platform.OS !== 'ios') return;
  Alert.prompt(title, undefined, [{ text: strings.common.cancel, style: 'cancel' }, { text: strings.common.save, onPress: (v?: string) => onDone((v ?? '').trim().slice(0, 30)) }], 'plain-text', current);
}

function Hero({ subtitle, body }: { subtitle: string; body: string }) {
  const s = strings.santa;
  return (
    <Card inner={st.heroInner}>
      <View style={{ flex: 1, gap: 6 }}>
        <H1 style={{ fontSize: 34, lineHeight: 38 }}>{s.title}</H1>
        <Accent>{subtitle}</Accent>
        <P muted style={{ fontSize: 14, lineHeight: 20 }}>{body}</P>
      </View>
      <Icon name="santa" size={112} float />
    </Card>
  );
}

function Setup({ state, setState }: Props) {
  const s = strings.santa;
  const [name, setName] = useState('');
  const [pick, setPick] = useState<string | null>(null);
  const [error, setError] = useState('');
  const nameOf = (id: string) => state.people.find((p) => p.id === id)?.name ?? '?';

  function add() {
    const n = name.trim();
    if (!n) return;
    haptic.tap();
    setState((p) => ({ ...p, people: [...p.people, { id: uid(), name: n.slice(0, 30) }] }));
    setName('');
    setError('');
  }

  function remove(id: string) {
    setState((p) => ({ ...p, people: p.people.filter((x) => x.id !== id), rules: p.rules.filter((r) => !r.includes(id)) }));
  }

  function tapForRule(id: string) {
    if (!pick) return setPick(id);
    if (pick !== id && !state.rules.some((r) => r.includes(pick) && r.includes(id))) {
      setState((p) => ({ ...p, rules: [...p.rules, [pick, id]] }));
    }
    setPick(null);
  }

  function draw() {
    if (state.people.length < 3) return setError(s.needThree);
    const result = drawNames(state.people, state.rules);
    if (!result) return setError(s.noSolution);
    haptic.success();
    setState((p) => ({ ...p, draw: result, seen: [] }));
  }

  return (
    <Scene>
      <Hero subtitle={fmt(s.people, { n: state.people.length })} body={s.intro} />

      <View style={st.grid}>
        <InfoTile icon="money" title={s.budget} value={state.budget || '—'} onPress={() => ask(s.budget, state.budget, (v) => setState((p) => ({ ...p, budget: v })))} />
        <InfoTile icon="calendar" title={s.date} value={state.date || s.datePlaceholder} onPress={() => ask(s.date, state.date, (v) => setState((p) => ({ ...p, date: v })))} />
      </View>

      {Platform.OS !== 'ios' && (
        <View style={st.grid}>
          <Field style={{ flex: 1 }} value={state.budget} onChangeText={(v) => setState((p) => ({ ...p, budget: v }))} placeholder={s.budget} />
          <Field style={{ flex: 1 }} value={state.date} onChangeText={(v) => setState((p) => ({ ...p, date: v }))} placeholder={s.datePlaceholder} />
        </View>
      )}

      <Card>
        <View style={st.listHead}>
          <View style={{ flex: 1 }}>
            <H2 style={{ fontSize: 26 }}>{s.participants}</H2>
            <Accent style={{ fontSize: 16 }}>{fmt(s.people, { n: state.people.length })}</Accent>
          </View>
          <Icon name="gift" size={78} float />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Field style={{ flex: 1 }} value={name} onChangeText={setName} placeholder={s.placeholder} onSubmitEditing={add} returnKeyType="done" />
          <Button title={strings.common.add} onPress={add} style={{ paddingHorizontal: 18 }} />
        </View>

        {state.people.map((p, i) => (
          <PersonRow
            key={p.id}
            index={i}
            title={p.name}
            onMenu={() =>
              Alert.alert(p.name, undefined, [
                { text: strings.common.cancel, style: 'cancel' },
                { text: strings.common.delete, style: 'destructive', onPress: () => remove(p.id) },
              ])
            }
          />
        ))}
      </Card>

      {state.people.length >= 3 && (
        <Card>
          <H2>{s.rules}</H2>
          <P muted style={{ fontSize: 14 }}>{s.rulesHint}</P>
          <View style={st.wrap}>
            {state.people.map((p) => (
              <Chip key={p.id} label={p.name} on={pick === p.id} onPress={() => tapForRule(p.id)} />
            ))}
          </View>
          {state.rules.map(([a, b], i) => (
            <View key={`${a}-${b}`} style={st.rule}>
              <P style={{ flex: 1 }}>{nameOf(a)}  ⟷  {nameOf(b)}</P>
              <Pressable hitSlop={10} onPress={() => setState((p) => ({ ...p, rules: p.rules.filter((_, j) => j !== i) }))}>
                <Text style={st.x}>×</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      {!!error && <P style={{ color: colors.danger }} center>{error}</P>}
      <Button title={s.draw} chevrons onPress={draw} disabled={state.people.length < 3} />
    </Scene>
  );
}

function Reveal({ state, setState }: Props) {
  const s = strings.santa;
  const [who, setWho] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showing, setShowing] = useState(false);
  const person = state.people.find((p) => p.id === who);
  const receiver = who && state.draw ? state.people.find((p) => p.id === state.draw![who]) : null;

  function close() {
    if (who && confirmed && !state.seen.includes(who)) setState((p) => ({ ...p, seen: [...p.seen, who] }));
    setWho(null);
    setConfirmed(false);
    setShowing(false);
  }

  function restart() {
    Alert.alert(s.restart, s.restartConfirm, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: s.restart, style: 'destructive', onPress: () => setState(EMPTY) },
    ]);
  }

  if (person) {
    return (
      <Scene scroll={false} contentStyle={st.centerFill}>
        {!confirmed ? (
          <Card inner={{ alignItems: 'center', gap: 18 }}>
            <Icon name="shush" size={110} float />
            <H1 style={{ textAlign: 'center', fontSize: 32 }}>{fmt(s.areYou, { name: person.name })}</H1>
            <Button title={s.yes} chevrons onPress={() => setConfirmed(true)} style={{ alignSelf: 'stretch' }} />
            <TextButton title={strings.common.cancel} onPress={close} />
          </Card>
        ) : (
          <Card>
            <Pressable
              onPressIn={() => {
                haptic.press();
                setShowing(true);
              }}
              onPressOut={() => setShowing(false)}
              style={st.revealBox}
              accessibilityRole="button"
              accessibilityLabel={s.hold}
            >
              {showing && receiver ? (
                <>
                  <Accent style={{ textAlign: 'center' }}>{s.youGive}</Accent>
                  <Text style={st.receiver}>{receiver.name}</Text>
                  {(!!state.budget || !!state.date) && (
                    <P muted center>{[state.budget && `${s.budget}: ${state.budget}`, state.date].filter(Boolean).join('  ·  ')}</P>
                  )}
                </>
              ) : (
                <>
                  <Icon name="gift" size={130} float />
                  <P center>{s.hold}</P>
                </>
              )}
            </Pressable>
            <Button title={s.hide} variant="dark" onPress={close} />
          </Card>
        )}
      </Scene>
    );
  }

  return (
    <Scene>
      <Hero subtitle={fmt(s.people, { n: state.people.length })} body={s.pass} />
      <View style={st.grid}>
        <InfoTile icon="money" title={s.budget} value={state.budget || '—'} />
        <InfoTile icon="calendar" title={s.date} value={state.date || '—'} />
      </View>
      <Card>
        <View style={st.listHead}>
          <View style={{ flex: 1 }}>
            <H2 style={{ fontSize: 26 }}>{s.participants}</H2>
            <Accent style={{ fontSize: 16 }}>{fmt(s.people, { n: state.people.length })}</Accent>
          </View>
          <Icon name="gift" size={78} float />
        </View>
        {state.people.map((p, i) => {
          const seen = state.seen.includes(p.id);
          return (
            <PersonRow
              key={p.id}
              index={i}
              title={p.name}
              subtitle={seen ? `✓ ${s.seen}` : s.notSeen}
              onPress={() => setWho(p.id)}
              right={<Text style={[st.status, seen && { color: colors.yellow }]}>{seen ? '✓' : '›'}</Text>}
            />
          );
        })}
      </Card>
      <TextButton danger title={s.restart} onPress={restart} />
    </Scene>
  );
}

const st = StyleSheet.create({
  heroInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grid: { flexDirection: 'row', gap: 12 },
  listHead: { flexDirection: 'row', alignItems: 'center', marginTop: -6, marginBottom: -4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  x: { color: colors.muted, fontSize: 22, lineHeight: 24 },
  status: { color: colors.muted, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 20 },
  centerFill: { justifyContent: 'center' },
  revealBox: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10 },
  receiver: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 44, textAlign: 'center' },
});
