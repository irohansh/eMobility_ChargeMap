# Distance Display Fix for Station Popups

## Issue
Station popups on the map were not consistently showing distance information to users.

## Root Cause
The distance was only displayed when:
1. Station was considered "nearby" (within 50km radius)
2. User location was available
3. Station was in the `nearbyStations` array

This meant that stations outside the 50km radius wouldn't show their distance, even though the user's location was available.

## Solution

### 1. Updated Distance Calculation Logic
**Before:**
```typescript
{isNearby && userLocation && (
  <p className="text-xs text-blue-600 mt-1">
    {(station as any).distance}km away
  </p>
)}
```
Only showed distance for "nearby" stations

**After:**
```typescript
// Calculate distance for all stations when user location is available
let distance = null;
if (userLocation) {
  distance = calculateDistance(
    userLocation.lat,
    userLocation.lon,
    station.location.coordinates[1],
    station.location.coordinates[0]
  );
}

{distance !== null && (
  <p className="text-xs text-blue-600 mt-1">
    {distance}km away
  </p>
)}
```
Shows distance for ALL stations when user location is available

### 2. Updated TypeScript Interface
**Before:**
```typescript
export interface Station {
  _id: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  chargers: {
    _id: string;
    connectorType: 'Type 2' | 'CCS' | 'CHAdeMO';
    powerKW: number;
    status: 'available' | 'occupied' | 'out-of-order';
  }[];
}
```

**After:**
```typescript
export interface Station {
  _id: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  chargers: {
    _id: string;
    connectorType: 'Type 2' | 'CCS' | 'CHAdeMO';
    powerKW: number;
    status: 'available' | 'occupied' | 'out-of-order';
  }[];
  distance?: number; // Distance from user location in km
}
```

### 3. Removed Type Casting
**Before:**
```typescript
{(station as any).distance}km away
```

**After:**
```typescript
{station.distance}km away
```

## Benefits

### User Experience:
✅ **Consistent Distance Display:** All stations show distance when user location is available
✅ **Better Decision Making:** Users can see how far each station is from their location
✅ **No Distance Limit:** Distance shown for stations beyond 50km radius
✅ **Real-time Calculation:** Distance calculated on-demand for each station

### Technical Improvements:
✅ **Proper TypeScript:** No more type casting with `(station as any)`
✅ **Cleaner Code:** Distance calculation logic is more explicit
✅ **Better Performance:** Distance calculated only when needed
✅ **Type Safety:** Proper interface definition for distance property

## How It Works

### Distance Calculation:
1. **User Location Available:** When user enables location services
2. **Real-time Calculation:** Distance calculated for each station popup
3. **Haversine Formula:** Accurate distance calculation using coordinates
4. **Display Format:** Shows distance in kilometers (e.g., "5.2km away")

### Display Logic:
1. **Check User Location:** Only calculate if user location is available
2. **Calculate Distance:** Use coordinates to determine distance
3. **Show Distance:** Display distance for all stations, not just nearby ones
4. **Format Display:** Show as "X.Xkm away" in blue text

## Testing Scenarios

### ✅ Test Cases:
1. **User Location Enabled:** All stations show distance
2. **User Location Disabled:** No distance shown (as expected)
3. **Nearby Stations:** Distance shown correctly
4. **Far Stations:** Distance shown correctly (beyond 50km)
5. **Multiple Stations:** Each station shows its own distance
6. **Map Interaction:** Distance updates when clicking different stations

## Result

**Before:** Distance only shown for stations within 50km radius  
**After:** Distance shown for ALL stations when user location is available  
**Status:** ✅ Fixed  
**User Experience:** ✅ Improved - consistent distance information

Now when users click on any station marker on the map, they'll see the distance from their current location, regardless of how far the station is!
