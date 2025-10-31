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
import { Calendar, Clock, Zap, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Station } from "@/services/api";

interface EnhancedBookingModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

const EnhancedBookingModal: React.FC<EnhancedBookingModalProps> = ({
  station,
  isOpen,
  onClose,
  onBookingCreated,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.zIndex = '9998';
    } else {
      document.body.style.zIndex = '';
    }
    return () => {
      document.body.style.zIndex = '';
    };
  }, [isOpen]);
  const [selectedCharger, setSelectedCharger] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && station) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const defaultDate = today.toISOString().split('T')[0];
      setSelectedDate(defaultDate);
      loadAvailableSlots(defaultDate);
    }
  }, [isOpen, station]);

  const loadAvailableSlots = async (date: string) => {
    if (!station || !date) return;

    try {
      setIsLoadingSlots(true);
      
      const response = await fetch(
        `http://localhost:3000/api/availability/slots?stationId=${station._id}&date=${date}`
      );
      const data = await response.json();
      
      setAvailableSlots(data.availableSlots || []);
      
      const bookedResponse = await fetch(
        `http://localhost:3000/api/availability/booked?stationId=${station._id}&date=${date}`
      );
      const bookedData = await bookedResponse.json();
      
      setBookedSlots(bookedData.bookedSlots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: "Error Loading Slots",
        description: "Failed to load available time slots.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    loadAvailableSlots(date);
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setUseCustomTime(false);
    
    const slotStart = new Date(slot.time);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + 1);
    
    setCustomStartTime(slotStart.toISOString().slice(0, 16));
    setCustomEndTime(slotEnd.toISOString().slice(0, 16));
  };

  const getAvailableHours = (chargerId: string) => {
    return availableSlots
      .filter(slot => slot.chargerId === chargerId)
      .sort((a, b) => a.hour - b.hour);
  };

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

    if (!station || !selectedCharger) {
      toast({
        title: "Missing Information",
        description: "Please select a charger.",
        variant: "destructive",
      });
      return;
    }

    let startTime: string;
    let endTime: string;

    if (useCustomTime) {
      if (!customStartTime || !customEndTime) {
        toast({
          title: "Missing Times",
          description: "Please enter both start and end times.",
          variant: "destructive",
        });
        return;
      }
      startTime = customStartTime;
      endTime = customEndTime;
    } else {
      if (!selectedSlot) {
        toast({
          title: "No Time Slot Selected",
          description: "Please select a time slot or enter custom times.",
          variant: "destructive",
        });
        return;
      }
      
      const slotStart = new Date(selectedSlot.time);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotEnd.getHours() + 1);
      
      startTime = slotStart.toISOString();
      endTime = slotEnd.toISOString();
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
        description: "Your charging session has been booked! A confirmation email has been sent.",
      });

      onBookingCreated();
      onClose();
      
      setSelectedCharger("");
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedSlot(null);
      setVehicleInfo("");
      setUseCustomTime(false);
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
  const selectedChargerObject = availableChargers.find(c => c._id === selectedCharger);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 99999 }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Book Charging Session
          </DialogTitle>
          <DialogDescription>
            Select a charger and time slot at {station?.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="charger">Select Charger</Label>
            <Select value={selectedCharger} onValueChange={setSelectedCharger} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a charger type" />
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

          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading available slots...</span>
            </div>
          ) : selectedCharger && availableSlots.length > 0 ? (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {getAvailableHours(selectedCharger).map((slot, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant={selectedSlot?.hour === slot.hour ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSlotSelect(slot)}
                    className={selectedSlot?.hour === slot.hour ? "shadow-electric" : ""}
                  >
                    {slot.displayTime}
                  </Button>
                ))}
              </div>
            </div>
          ) : selectedCharger ? (
            <div className="text-center py-4 text-muted-foreground">
              No available slots for this date
            </div>
          ) : null}

          {selectedCharger && !useCustomTime && (
            <Button
              type="button"
              variant="link"
              onClick={() => setUseCustomTime(true)}
            >
              Or enter custom time
            </Button>
          )}

          {useCustomTime && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  min={customStartTime || new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>
          )}

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

export default EnhancedBookingModal;
