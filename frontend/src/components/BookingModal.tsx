import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Station } from "@/services/api";

interface BookingModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  station,
  isOpen,
  onClose,
  onBookingCreated,
}) => {
  const [selectedCharger, setSelectedCharger] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const defaultStart = now.toISOString().slice(0, 16);
      
      const endDate = new Date(now);
      endDate.setHours(endDate.getHours() + 1);
      const defaultEnd = endDate.toISOString().slice(0, 16);
      
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    if (!station || !selectedCharger || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.createBooking({
        stationId: station._id,
        chargerId: selectedCharger,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        vehicleInfo: vehicleInfo || undefined,
      });

      toast({
        title: "Booking Created Successfully",
        description: "Your charging session has been booked! A confirmation email has been sent to your registered email address.",
      });

      onBookingCreated();
      onClose();
      
      setSelectedCharger("");
      setStartTime("");
      setEndTime("");
      setVehicleInfo("");
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableChargers = station?.chargers.filter(charger => charger.status === 'available') || [];

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30); // Maximum 30 days from now
    return max.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Book Charging Session
          </DialogTitle>
          <DialogDescription>
            Book a charging session at {station?.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="charger">Available Charger</Label>
            <Select value={selectedCharger} onValueChange={setSelectedCharger} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a charger" />
              </SelectTrigger>
              <SelectContent>
                {availableChargers.map((charger) => (
                  <SelectItem key={charger._id} value={charger._id}>
                    {charger.connectorType} - {charger.powerKW}kW
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="datetime-local"
                  className="pl-10"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={getMinDateTime()}
                  max={getMaxDateTime()}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="datetime-local"
                  className="pl-10"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || getMinDateTime()}
                  max={getMaxDateTime()}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleInfo">Vehicle Information (Optional)</Label>
            <Textarea
              id="vehicleInfo"
              placeholder="e.g., Tesla Model 3, License Plate: ABC123"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="shadow-electric">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Booking...
                </>
              ) : (
                "Book Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;

