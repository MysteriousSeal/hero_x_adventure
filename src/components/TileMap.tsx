import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TILE_SIZE } from '../game/config';
import { MAP, MAP_HEIGHT, MAP_WIDTH } from '../game/map';
import { TILE_COLORS, TILE_SPRITES } from '../game/sprites';

function TileMapComponent() {
  return (
    <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
      {MAP.map((row, r) =>
        row.map((tile, c) => {
          const sprite = TILE_SPRITES[tile];
          const style = [
            styles.tile,
            { left: c * TILE_SIZE, top: r * TILE_SIZE },
            !sprite && { backgroundColor: TILE_COLORS[tile] },
          ];
          return sprite ? (
            <Image key={`${r}-${c}`} source={sprite} style={style} resizeMode="stretch" />
          ) : (
            <View key={`${r}-${c}`} style={style} />
          );
        }),
      )}
    </View>
  );
}

export const TileMap = memo(TileMapComponent);

const styles = StyleSheet.create({
  tile: { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },
});
