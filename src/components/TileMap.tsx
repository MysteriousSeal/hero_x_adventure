import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TILE_SIZE } from '../game/config';
import { PIXELATED, TILE_COLORS, TILE_SPRITES, TREE_SPRITES } from '../game/sprites';
import { getTile, getTreeVariant, TileType } from '../game/world';

const Tile = memo(function Tile({
  type,
  variant,
  x,
  y,
}: {
  type: TileType;
  variant: number;
  x: number;
  y: number;
}) {
  // Trees have a transparent background, so they stand on a grass tile.
  if (type === 'tree') {
    return (
      <View style={[styles.tile, { left: x, top: y, backgroundColor: TILE_COLORS.grass }]}>
        <Image source={TREE_SPRITES[variant]} style={[styles.tile, PIXELATED]} resizeMode="stretch" />
      </View>
    );
  }
  const sprite = TILE_SPRITES[type];
  return sprite ? (
    <Image source={sprite} style={[styles.tile, { left: x, top: y }, PIXELATED]} resizeMode="stretch" />
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
      const type = getTile(c, r);
      tiles.push(
        <Tile
          key={`${c},${r}`}
          type={type}
          variant={type === 'tree' ? getTreeVariant(c, r) : 0}
          x={c * TILE_SIZE}
          y={r * TILE_SIZE}
        />,
      );
    }
  }
  return <>{tiles}</>;
});

const styles = StyleSheet.create({
  tile: { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },
});
