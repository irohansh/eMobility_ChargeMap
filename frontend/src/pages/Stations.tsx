import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Zap, Clock, Filter, Loader2, ExternalLink, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, Station, RealStation } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedBookingModal from "@/components/EnhancedBookingModal";
import OpenStreetMap from "@/components/OpenStreetMap";
import RealStationMap from "@/components/RealStationMap";

const Stations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [realStations, setRealStations] = useState<RealStation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [useRealStations, setUseRealStations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [mapSelectedStation, setMapSelectedStation] = useState<Station | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (useRealStations && userLocation && realStations.length === 0) {
      loadRealStations();
    }
  }, [useRealStations, userLocation]);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAllStations();
      setStations(data);
    } catch (error) {
      toast({
        title: "Error Loading Stations",
        description: error instanceof Error ? error.message : "Failed to load stations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        toast({
          title: "Location Found",
          description: "Showing stations near your location.",
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Could not get your location. Please enable location services.",
          variant: "destructive",
        });
        setIsLoadingLocation(false);
      }
    );
  };

  const loadNearbyStations = async () => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiClient.getStationRecommendations({
        currentLocation: { lat: userLocation.lat, lon: userLocation.lon },
        carRange: 50,
      });
      setStations(data);
      toast({
        title: "Nearby Stations Loaded",
        description: `Found ${data.length} stations near you.`,
      });
    } catch (error) {
      toast({
        title: "Error Loading Nearby Stations",
        description: error instanceof Error ? error.message : "Failed to load nearby stations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealStations = async () => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiClient.getRealStations(
        userLocation.lat,
        userLocation.lon,
        50
      );
      
      const stationsArray = Array.isArray(data) ? data : [];
      setRealStations(stationsArray);
      
      if (stationsArray.length === 0) {
        toast({
          title: "No Stations Found",
          description: "No charging stations found near your location. Try a different location or increase the radius.",
          variant: "default",
        });
      } else {
        toast({
          title: "Real Stations Loaded",
          description: `Found ${stationsArray.length} real stations near you.`,
        });
      }
    } catch (error) {
      setRealStations([]);
      toast({
        title: "Error Loading Real Stations",
        description: error instanceof Error ? error.message : "Failed to load real stations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedStations = async () => {
    try {
      setIsSeeding(true);
      await apiClient.seedStations();
      toast({
        title: "Stations Seeded",
        description: "Sample charging stations have been added to the database.",
      });
      loadStations();
    } catch (error) {
      toast({
        title: "Error Seeding Stations",
        description: error instanceof Error ? error.message : "Failed to seed stations",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const getAvailableChargers = (station: Station) => {
    return station.chargers.filter(charger => charger.status === 'available').length;
  };

  const getMaxPower = (station: Station) => {
    return Math.max(...station.chargers.map(charger => charger.powerKW));
  };

  const getConnectorTypes = (station: Station) => {
    return [...new Set(station.chargers.map(charger => charger.connectorType))];
  };

  const activeStations = useRealStations ? realStations : stations;
  
  const filteredStations = activeStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookStation = (station: Station) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a charging session.",
        variant: "destructive",
      });
      return;
    }
    setSelectedStation(station);
    setIsBookingModalOpen(true);
  };

  const handleBookingCreated = () => {
    loadStations();
  };

  const handleMapStationSelect = (station: Station) => {
    setMapSelectedStation(station);
    setSelectedStation(station);
    setIsBookingModalOpen(true);
  };

  const openInGoogleMaps = (station: Station) => {
    const { coordinates } = station.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Find Charging Stations
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover available EV charging stations near you
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location or station name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="flex items-center gap-2"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {isLoadingLocation ? "Getting Location..." : "My Location"}
            </Button>
            <Button 
              variant="default" 
              onClick={loadNearbyStations}
              disabled={!userLocation}
              className="shadow-electric flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Show Nearby
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSeedStations}
              disabled={isSeeding}
              className="flex items-center gap-2"
            >
              {isSeeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isSeeding ? "Seeding..." : "Seed Stations"}
            </Button>
            <Button 
              variant={useRealStations ? "default" : "outline"}
              onClick={async () => {
                if (!useRealStations && userLocation) {
                  await loadRealStations();
                  setUseRealStations(true);
                } else {
                  setUseRealStations(!useRealStations);
                  if (!useRealStations) {
                    loadStations();
                  }
                }
              }}
              disabled={!userLocation}
              className={`flex items-center gap-2 ${useRealStations ? 'shadow-electric' : ''}`}
            >
              <Globe className="w-4 h-4" />
              {useRealStations ? "Real Stations" : "Load Real Stations"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              size="sm"
            >
              List View
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              size="sm"
            >
              Map View
            </Button>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading stations...</span>
              </div>
            ) : filteredStations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No stations found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {stations.length === 0 
                      ? "No charging stations available. Click 'Seed Stations' to add sample data."
                      : "No stations match your search criteria."
                    }
                  </p>
                  {stations.length === 0 && (
                    <Button onClick={handleSeedStations} disabled={isSeeding}>
                      {isSeeding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Seeding...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Seed Stations
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredStations.map((station) => {
                const availableChargers = getAvailableChargers(station);
                const totalChargers = station.chargers.length;
                const maxPower = getMaxPower(station);
                const connectorTypes = getConnectorTypes(station);
                const isAvailable = availableChargers > 0;

                return (
                  <Card key={station._id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl mb-2">{station.name}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{station.address}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {station.location.coordinates[1].toFixed(4)}°N, {station.location.coordinates[0].toFixed(4)}°W
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant={isAvailable ? "default" : "secondary"}
                            className={isAvailable ? "bg-green-500" : ""}
                          >
                            {isAvailable ? "Available" : "Busy"}
                          </Badge>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="shadow-electric"
                              onClick={() => handleBookStation(station)}
                              disabled={!isAvailable}
                            >
                              {isAvailable ? "Book Now" : "Unavailable"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openInGoogleMaps(station)}
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Maps
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-sm">
                            {availableChargers}/{totalChargers} available
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm">Up to {maxPower}kW</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {connectorTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {viewMode === "map" && (
          <div className="relative">
            <div className="h-96 w-full rounded-lg overflow-hidden border border-border">
              {useRealStations ? (
                <RealStationMap
                  userLocation={userLocation}
                  onStationSelect={handleMapStationSelect}
                />
              ) : (
                <OpenStreetMap
                  stations={filteredStations}
                  onStationSelect={handleMapStationSelect}
                  selectedStation={mapSelectedStation}
                  userLocation={userLocation}
                />
              )}
            </div>
            {mapSelectedStation && (
              <div className="absolute top-4 left-4 right-4 z-50">
                <Card className="shadow-xl border-2 border-primary/30 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="truncate">{mapSelectedStation.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMapSelectedStation(null)}
                        className="ml-2 flex-shrink-0"
                      >
                        ✕
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="line-clamp-2">{mapSelectedStation.address}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>
                          {mapSelectedStation.chargers.filter(c => c.status === 'available').length}/
                          {mapSelectedStation.chargers.length} chargers available
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleBookStation(mapSelectedStation)}
                          className="shadow-electric flex-1 bg-primary hover:bg-primary/90"
                        >
                          Book Charging Session
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInGoogleMaps(mapSelectedStation)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        <EnhancedBookingModal
          station={selectedStation}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedStation(null);
          }}
          onBookingCreated={handleBookingCreated}
        />
      </div>
    </div>
  );
};

export default Stations;