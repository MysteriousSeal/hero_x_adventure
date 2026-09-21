import { useState } from 'react';
import { Game } from './src/components/Game';
import { CharacterId } from './src/game/sprites';
import { CharacterSelect } from './src/screens/CharacterSelect';

export default function App() {
  const [character, setCharacter] = useState<CharacterId | null>(null);
  return character ? <Game character={character} /> : <CharacterSelect onStart={setCharacter} />;
}
