import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TILE_SIZE } from '../game/config';
import { TILE_COLORS, TILE_SPRITES } from '../game/sprites';
import { getTile, TileType } from '../game/world';

const Tile = memo(function Tile({ type, x, y }: { type: TileType; x: number; y: number }) {
  const sprite = TILE_SPRITES[type];
  return sprite ? (
    <Image source={sprite} style={[styles.tile, { left: x, top: y }]} resizeMode="stretch" />
  ) : (
    <View style={[styles.tile, { left: x, top: y, backgroundColor: TILE_COLORS[type] }]} />
  );
});

interface Props {
  /** First visible tile (world tile coordinates) and how many to draw. */
  startCol: number;
  startRow: number;
  cols: number;
  rows: number;
}

/**
 * Draws the window of tiles around the camera. Props only change when the
 * camera crosses a tile boundary, so the memo skips almost every frame.
 */
export const TileMap = memo(function TileMap({ startCol, startRow, cols, rows }: Props) {
  const tiles = [];
  for (let r = startRow; r < startRow + rows; r++) {
    for (let c = startCol; c < startCol + cols; c++) {
      tiles.push(<Tile key={`${c},${r}`} type={getTile(c, r)} x={c * TILE_SIZE} y={r * TILE_SIZE} />);
    }
  }
  return <>{tiles}</>;
});

const styles = StyleSheet.create({
  tile: { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },
});
