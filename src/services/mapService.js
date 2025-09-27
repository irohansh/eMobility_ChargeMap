class MapService {
    static async getRoute(origin, destination) {
        console.log(`MOCK getRoute called for ${origin} to ${destination}`);
        return {
            estimatedTime: "18 mins (with current traffic)",
            distance: "12.3 km",
            routeCoordinates: "encoded_polyline_string_goes_here...",
            status: "MOCK_DATA"
        };
    }
}

module.exports = MapService;