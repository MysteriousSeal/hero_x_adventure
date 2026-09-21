import { memo, useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { TILE_SIZE } from '../game/config';
import { hash2 } from '../game/noise';
import {
  BRIDGE_SPRITE,
  BUILDING_SPRITES,
  GRASS_SPRITES,
  PAVED_SPRITES,
  PIXELATED,
  FRINGE_SPRITES,
  ROAD_SPRITES,
  SHORE_SPRITES,
  TALL_GRASS_SPRITES,
  TILE_COLORS,
  TILE_SPRITES,
  TREE_BASE_Y,
  TREE_SIZE,
  TREE_SPRITES,
  WATER_SPRITES,
} from '../game/sprites';
import { useWaterFrame } from '../game/waterClock';
import { isTallGrass } from '../game/terrain';
import { Building, roadPiece, villagesInRect } from '../game/village';
import { getRoadMask, getTile, getTreeVariant, TileType, WORLD_SEED } from '../game/world';

/** Trees sort against the hero (and each other) by the y of their trunk base. */
export const zForY = (y: number) => Math.round(y) + 1_000_000;

const Tile = memo(function Tile({
  type,
  col,
  row,
}: {
  type: TileType;
  col: number;
  row: number;
}) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const pos = { left: x, top: y };

  if (type === 'water' || type === 'bridge') return <WaterTile col={col} row={row} bridge={type === 'bridge'} />;

  if (type === 'paved') {
    const paved = PAVED_SPRITES[Math.floor(hash2(col, row, WORLD_SEED + 9) * PAVED_SPRITES.length)];
    return <Image source={paved} style={[styles.tile, pos, PIXELATED]} resizeMode="stretch" />;
  }

  // Grass, tall grass, roads, buildings and the ground under trees all sit on a grass tile.
  if (type === 'grass' || type === 'tallgrass' || type === 'tree' || type === 'road' || type === 'building') {
    const ground = GRASS_SPRITES[Math.floor(hash2(col, row, WORLD_SEED + 5) * GRASS_SPRITES.length)];
    if (type === 'road') {
      const { piece, rotation } = roadPiece(getRoadMask(col, row));
      return (
        <View style={[styles.tile, pos]}>
          <Image source={ground} style={[styles.tile, PIXELATED]} resizeMode="stretch" />
          <Image
            source={ROAD_SPRITES[piece]}
            style={[styles.tile, PIXELATED, { transform: [{ rotate: `${rotation}deg` }] }]}
            resizeMode="stretch"
          />
        </View>
      );
    }
    // Tall grass also grows under trees, so a tree inside a patch stands in the tall grass.
    if (type !== 'tallgrass' && !(type === 'tree' && isTallGrass(col, row))) {
      if (type !== 'grass' && type !== 'tree') return <Image source={ground} style={[styles.tile, pos, PIXELATED]} resizeMode="stretch" />;
      return <GrassTile ground={ground} col={col} row={row} pos={pos} />;
    }
    const tall = TALL_GRASS_SPRITES[Math.floor(hash2(col, row, WORLD_SEED + 7) * TALL_GRASS_SPRITES.length)];
    return (
      <View style={[styles.tile, pos]}>
        <Image source={ground} style={[styles.tile, PIXELATED]} resizeMode="stretch" />
        <Image source={tall} style={[styles.tile, PIXELATED]} resizeMode="stretch" />
      </View>
    );
  }

  const sprite = TILE_SPRITES[type];
  return sprite ? (
    <Image source={sprite} style={[styles.tile, pos, PIXELATED]} resizeMode="stretch" />
  ) : (
    <View style={[styles.tile, pos, { backgroundColor: TILE_COLORS[type] }]} />
  );
});

const Tree = memo(function Tree({ col, row }: { col: number; row: number }) {
  // Jittered off the tile grid, and bigger than a tile, so neighbours overlap into a forest.
  const jx = Math.round((hash2(col, row, WORLD_SEED + 6) - 0.5) * 5) * 2;
  const jy = Math.round((hash2(col, row, WORLD_SEED + 8) - 0.5) * 4) * 2;
  const left = col * TILE_SIZE + TILE_SIZE / 2 - TREE_SIZE / 2 + jx;
  const baseY = (row + 1) * TILE_SIZE - 2 + jy; // even, so it stays on the native pixel grid
  return (
    <Image
      source={TREE_SPRITES[getTreeVariant(col, row)]}
      style={[styles.tree, PIXELATED, { left, top: baseY - TREE_BASE_Y, zIndex: zForY(baseY) }]}
      resizeMode="stretch"
    />
  );
});

const isWater = (t: TileType) => t === 'water' || t === 'bridge';
const isTallAt = (col: number, row: number) => {
  const t = getTile(col, row);
  return t === 'tallgrass' || (t === 'tree' && isTallGrass(col, row));
};
const turn = (k: number) => ({ transform: [{ rotate: `${k * 90}deg` }] });

/**
 * Which edge pieces a tile needs, given a test for "the neighbour at (dc, dr) is the other kind".
 * source: 0 edge, 1 corner (two adjacent sides), 2 inner (diagonal only); rotation in quarter turns.
 */
function edgePieces(other: (dc: number, dr: number) => boolean) {
  const sides = [other(0, -1), other(1, 0), other(0, 1), other(-1, 0)]; // N, E, S, W
  const out: { source: number; rotation: number }[] = [];
  const used = [false, false, false, false];
  for (let k = 0; k < 4; k++) {
    const next = (k + 1) % 4;
    if (sides[k] && sides[next]) {
      out.push({ source: 1, rotation: k }); // corner k joins sides k and k+1 (N+E, E+S, S+W, W+N)
      used[k] = used[next] = true;
    }
  }
  for (let k = 0; k < 4; k++) if (sides[k] && !used[k]) out.push({ source: 0, rotation: k });
  const diags = [other(1, -1), other(1, 1), other(-1, 1), other(-1, -1)]; // NE, SE, SW, NW
  for (let k = 0; k < 4; k++) if (diags[k] && !sides[k] && !sides[(k + 1) % 4]) out.push({ source: 2, rotation: k });
  return out;
}

/** Short grass, with ragged tall-grass blades along the sides that touch a tall-grass patch. */
function GrassTile({ ground, col, row, pos }: { ground: ImageSourcePropType; col: number; row: number; pos: object }) {
  const fringe = edgePieces((dc, dr) => isTallAt(col + dc, row + dr));
  if (fringe.length === 0) return <Image source={ground} style={[styles.tile, pos, PIXELATED]} resizeMode="stretch" />;
  const sources = [FRINGE_SPRITES.edge, FRINGE_SPRITES.corner, FRINGE_SPRITES.inner];
  return (
    <View style={[styles.tile, pos]}>
      <Image source={ground} style={[styles.tile, PIXELATED]} resizeMode="stretch" />
      {fringe.map((f, i) => (
        <Image key={i} source={sources[f.source]} style={[styles.tile, PIXELATED, turn(f.rotation)]} resizeMode="stretch" />
      ))}
    </View>
  );
}

/** Animated water with grass banks drawn wherever a neighbour is land. */
const WaterTile = memo(function WaterTile({ col, row, bridge }: { col: number; row: number; bridge: boolean }) {
  const frame = useWaterFrame();
  const banks = useMemo(() => edgePieces((dc, dr) => !isWater(getTile(col + dc, row + dr))), [col, row]);
  const sources = [SHORE_SPRITES.edge, SHORE_SPRITES.corner, SHORE_SPRITES.inner];

  return (
    <View style={[styles.tile, { left: col * TILE_SIZE, top: row * TILE_SIZE }]}>
      <Image source={WATER_SPRITES[frame]} style={[styles.tile, PIXELATED]} resizeMode="stretch" />
      {banks.map((b, i) => (
        <Image key={i} source={sources[b.source]} style={[styles.tile, PIXELATED, turn(b.rotation)]} resizeMode="stretch" />
      ))}
      {bridge && (
        <Image
          source={BRIDGE_SPRITE}
          style={[styles.tile, PIXELATED, turn(getRoadMask(col, row) & 10 ? 0 : 1)]}
          resizeMode="stretch"
        />
      )}
    </View>
  );
});

const BuildingView = memo(function BuildingView({ b }: { b: Building }) {
  return (
    <Image
      source={BUILDING_SPRITES[b.kind]}
      style={[
        PIXELATED,
        {
          position: 'absolute',
          left: b.col * TILE_SIZE,
          top: b.row * TILE_SIZE,
          width: b.w * TILE_SIZE,
          height: b.h * TILE_SIZE,
          zIndex: zForY((b.row + b.h) * TILE_SIZE - 1),
        },
      ]}
      resizeMode="stretch"
    />
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
  const nodes = [];
  // Trees are taller and wider than a tile, so look one extra tile around the window.
  for (let r = startRow - 1; r < startRow + rows + 2; r++) {
    for (let c = startCol - 1; c < startCol + cols + 1; c++) {
      const type = getTile(c, r);
      const inWindow = r >= startRow && r < startRow + rows && c >= startCol && c < startCol + cols;
      if (inWindow) nodes.push(<Tile key={`${c},${r}`} type={type} col={c} row={r} />);
      if (type === 'tree') nodes.push(<Tree key={`t${c},${r}`} col={c} row={r} />);
    }
  }
  // Buildings are drawn as one sprite each (up to 4 tiles wide), so look a few tiles outside the window.
  for (const v of villagesInRect(startCol - 6, startRow - 6, startCol + cols + 6, startRow + rows + 6)) {
    for (const b of v.buildings) {
      if (b.col + b.w >= startCol && b.col <= startCol + cols && b.row + b.h >= startRow && b.row <= startRow + rows + 1) {
        nodes.push(<BuildingView key={`b${b.col},${b.row}`} b={b} />);
      }
    }
  }
  return <>{nodes}</>;
});

const styles = StyleSheet.create({
  tile: { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },
  tree: { position: 'absolute', width: TREE_SIZE, height: TREE_SIZE },
});
