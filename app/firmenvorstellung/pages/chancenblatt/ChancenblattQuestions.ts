export const QUESTIONS = [
  {
    id: "q1",
    text: "Wenn du neuen Menschen begegnest – was beschreibt dich am ehesten?",
    options: [
      { label: "Ich gehe offen auf andere zu und komme schnell ins Gespräch", value: "q1_o", type: "O" },
      { label: "Im Gespräch entwickelt sich die Verbindung Schritt für Schritt", value: "q1_a", type: "A" },
      { label: "Ich brauche etwas Zeit, um mich zu öffnen", value: "q1_v", type: "V" },
      { label: "Ich bin anfangs eher zurückhaltend und beobachte", value: "q1_v2", type: "V" },
    ],
  },
  {
    id: "q2",
    text: "Wie nimmst du das Thema finanzielle Planung aktuell für dich wahr?",
    options: [
      { label: "Ich beschäftige mich bewusst und aktiv damit", value: "q2_o", type: "O" },
      { label: "Es ist mir wichtig, auch wenn es nicht ständig präsent ist", value: "q2_a", type: "A" },
      { label: "Ich mache mir gelegentlich Gedanken darüber", value: "q2_a2", type: "A" },
      { label: "Bisher hatte das Thema für mich keine große Priorität", value: "q2_v", type: "V" },
    ],
  },
  {
    id: "q3",
    text: "Wie gehst du vor, wenn sich eine neue Möglichkeit ergibt?",
    options: [
      { label: "Ich prüfe sie offen und entscheide mich zügig", value: "q3_o", type: "O" },
      { label: "Ich analysiere die Situation in Ruhe", value: "q3_a", type: "A" },
      { label: "Ich hole mir gern zusätzliche Meinungen ein", value: "q3_v", type: "V" },
      { label: "Ich entscheide selbstständig, wenn es sich stimmig anfühlt", value: "q3_s", type: "S" },
    ],
  },
  {
    id: "q4",
    text: "Welche Bedeutung hat persönliche Weiterentwicklung aktuell für dich?",
    options: [
      { label: "Sie ist ein fester Bestandteil meines Alltags", value: "q4_o", type: "O" },
      { label: "Ich beschäftige mich regelmäßig damit", value: "q4_a", type: "A" },
      { label: "Ich weiß, dass sie wichtig ist und gehe meinen Weg Schritt für Schritt", value: "q4_s", type: "S" },
      { label: "Im Moment stehen andere Themen im Vordergrund", value: "q4_v", type: "V" },
    ],
  },
  {
    id: "q5",
    text: "Wie arbeitest du am liebsten an neuen Themen oder Aufgaben?",
    options: [
      { label: "In einem unterstützenden Umfeld mit Austausch", value: "q5_o", type: "O" },
      { label: "Strukturiert, klar und gut vorbereitet", value: "q5_a", type: "A" },
      { label: "Eigenständig, mit Freiheit und gelegentlichem Input", value: "q5_s", type: "S" },
      { label: "Überwiegend allein und in meinem eigenen Tempo", value: "q5_v", type: "V" },
    ],
  },
  {
    id: "q6",
    text: "Was ist dir bei einer möglichen Zusammenarbeit grundsätzlich wichtig?",
    optional: true,
    options: [
      { label: "Klare Strukturen und Entwicklungsmöglichkeiten", value: "q6_a", type: "A" },
      { label: "Eine sinnvolle Tätigkeit mit Perspektive", value: "q6_o", type: "O" },
      { label: "Flexibilität und Eigenverantwortung", value: "q6_s", type: "S" },
      { label: "Stabilität, Verlässlichkeit und Sicherheit", value: "q6_v", type: "V" },
    ],
  },
];
