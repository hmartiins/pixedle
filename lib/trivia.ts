// Short, hardcoded curiosities for the most common emojis. Anything not in
// the map gets a friendly fallback. Server-side only — sent to the client
// after the game ends.

const TRIVIA: Record<string, string> = {
  "🐶": "O cachorro foi um dos primeiros animais domesticados pelos humanos, há mais de 15 mil anos.",
  "🐱": "Gatos passam cerca de 70% da vida dormindo — uma média de 13 a 16 horas por dia.",
  "🦄": "O unicornio é o animal nacional oficial da Escocia, mesmo sendo uma criatura mitologica.",
  "🍕": "A pizza margherita foi criada em 1889 em Napoles em homenagem a rainha Margherita da Italia.",
  "🍔": "O nome 'hamburguer' vem da cidade de Hamburgo, na Alemanha, de onde a receita teria emigrado para os EUA.",
  "🍟": "Embora chamadas de 'french fries' nos EUA, as batatas fritas provavelmente foram inventadas na Belgica.",
  "🍎": "Existem mais de 7.500 variedades de macas cultivadas no mundo.",
  "🍌": "Bananas sao tecnicamente bagas, e bananeiras nao sao arvores — sao ervas gigantes.",
  "🍓": "O morango e a unica fruta com sementes do lado de fora — em media 200 sementes cada.",
  "⚽": "A bola de futebol classica tem 32 paineis: 12 pentagonos pretos e 20 hexagonos brancos.",
  "🚀": "Para escapar da gravidade da Terra, um foguete precisa atingir cerca de 40.000 km/h.",
  "✈️": "Em qualquer momento, ha em media meio milhao de pessoas voando pelo mundo.",
  "🐧": "Pinguins nao voam, mas conseguem nadar a mais de 30 km/h.",
  "🦁": "O rugido de um leao pode ser ouvido a mais de 8 km de distancia.",
  "🐘": "Elefantes sao os unicos mamiferos terrestres que nao conseguem pular.",
  "🦒": "A girafa e o coracao tao grande quanto o de qualquer animal terrestre — pesa cerca de 11 kg.",
  "🐍": "Cobras nao tem palpebras — elas dormem com os olhos abertos.",
  "🐢": "Algumas tartarugas marinhas vivem mais de 100 anos.",
  "🦋": "Borboletas sentem o gosto da comida com as patas.",
  "🐝": "Abelhas batem as asas cerca de 200 vezes por segundo, criando o tipico zumbido.",
  "🌻": "Girassois jovens seguem o sol durante o dia, fenomeno chamado heliotropismo.",
  "🌹": "A rosa e cultivada ha mais de 5.000 anos, com origem provavel na Asia.",
  "🌈": "Arco iris sao na verdade circulos completos — voce so ve a metade por causa do horizonte.",
  "❤️": "O coracao humano bate cerca de 100 mil vezes por dia.",
  "💀": "O esqueleto adulto humano tem 206 ossos; bebes nascem com cerca de 270.",
  "👻": "A palavra 'ghost' vem do germanico 'gaistaz', que significava 'furia' ou 'sopro vital'.",
  "🤖": "A palavra 'robo' foi inventada em 1920 pelo escritor tcheco Karel Capek na peca R.U.R.",
  "🎮": "O primeiro videogame domestico, o Magnavox Odyssey, foi lancado em 1972.",
  "📱": "O primeiro smartphone, o IBM Simon, foi lancado em 1994 — tinha tela touch e e-mail.",
  "💎": "Diamantes sao a substancia natural mais dura conhecida — sao basicamente carbono cristalizado.",
  "☀️": "A luz do Sol leva cerca de 8 minutos e 20 segundos para chegar a Terra.",
  "🌙": "A Lua se afasta da Terra cerca de 3,8 cm por ano.",
  "⭐": "A estrela mais proxima da Terra (depois do Sol) e Proxima Centauri, a 4,2 anos luz.",
  "🔥": "O fogo nao e materia — e o resultado visivel de uma reacao quimica de combustao.",
  "🌊": "Mais de 80% dos oceanos da Terra ainda nao foram mapeados nem explorados.",
  "🍩": "O buraco no meio da rosquinha foi inventado para que ela cozinhasse de forma uniforme.",
  "🎂": "A tradicao de soprar velas em bolos de aniversario vem da Grecia Antiga.",
  "🍫": "O chocolate contem teobromina, substancia toxica para caes e gatos.",
  "☕": "Cafe e a segunda mercadoria mais comercializada do mundo, depois do petroleo.",
  "🐳": "A baleia azul e o maior animal que ja existiu — maior ate que qualquer dinossauro.",
  "🦈": "Tubaroes existem ha mais de 400 milhoes de anos — sao mais antigos que as arvores.",
  "🐙": "Polvos tem tres coracoes e sangue azul — usam cobre em vez de ferro para transportar oxigenio.",
  "🍉": "Uma melancia e composta por aproximadamente 92% de agua.",
  "🥑": "Botanicamente, o abacate e uma fruta — mais especificamente, uma baga grande.",
  "🦖": "O T-rex viveu cerca de 66 milhoes de anos atras, mais perto do nosso tempo do que do Stegosaurus.",
};

const FALLBACK = "Esse emoji ja viajou em milhares de mensagens pelo mundo todo. ✨";

export function getTrivia(emoji: string): string {
  return TRIVIA[emoji] ?? FALLBACK;
}
