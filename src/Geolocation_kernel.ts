const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

export type Position = {
  lat: number;
  lon: number;
};

export type WatcherId = {
  value: number;
};

export function getCurrentPosition(
  onFinish: (position: Position) => void,
  onError: () => void
): void {
  navigator.geolocation.getCurrentPosition(
    (position) =>
      onFinish({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
    onError,
    options
  );
}

export function watchPosition(
  onFinish: (position: Position) => void,
  onError: () => void
): WatcherId {
  const id = navigator.geolocation.watchPosition(
    (position) =>
      onFinish({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
    onError,
    options
  );

  return { value: id };
}

export function clearWatch(watcherId: WatcherId): void {
  navigator.geolocation.clearWatch(watcherId.value);
}
