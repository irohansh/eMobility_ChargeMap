import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Zap, User, Settings, Loader2, Star, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Booking } from "@/services/api";
import { Link } from "react-router-dom";
import ReviewModal from "@/components/ReviewModal";
import EditProfileModal from "@/components/EditProfileModal";
import PaymentModal from "@/components/PaymentModal";

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMyBookings();
      setBookings(data);
    } catch (error) {
      toast({
        title: "Error Loading Bookings",
        description: error instanceof Error ? error.message : "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await apiClient.cancelBooking(bookingId);
      toast({
        title: "Booking Cancelled",
        description: "Your charging session has been cancelled.",
      });
      loadBookings(); // Reload bookings
    } catch (error) {
      toast({
        title: "Error Cancelling Booking",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await apiClient.completeBooking(bookingId);
      toast({
        title: "Booking Completed",
        description: "Your charging session has been marked as completed.",
      });
      loadBookings(); // Reload bookings
    } catch (error) {
      toast({
        title: "Error Completing Booking",
        description: error instanceof Error ? error.message : "Failed to complete booking",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  const upcomingBookings = bookings.filter(booking => booking.status === 'confirmed');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  const totalHours = completedBookings.reduce((total, booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const handleReviewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleReviewCreated = () => {
    loadBookings();
  };

  const handleProfileUpdated = () => {
    refreshUser();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handlePayBooking = (booking: Booking) => {
    setSelectedPaymentBooking(booking);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    loadBookings();
    toast({
      title: "Payment Successful",
      description: "Your booking payment has been processed successfully.",
    });
  };
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            My Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your bookings and account settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{bookings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{Math.round(totalHours)}</div>
                  <div className="text-sm text-muted-foreground">Hours Charged</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{Math.round(totalHours * 50)}</div>
                  <div className="text-sm text-muted-foreground">kWh Used (est.)</div>
                </CardContent>
              </Card>
            </div>

            <Card data-bookings-section>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Bookings
                </CardTitle>
                <CardDescription>
                  View and manage your upcoming and past charging sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading bookings...</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by finding and booking a charging station.
                    </p>
                    <Button asChild className="shadow-electric">
                      <Link to="/stations">
                        <MapPin className="w-4 h-4 mr-2" />
                        Find Stations
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{booking.station?.name || 'Unknown Station'}</h4>
                            <Badge
                              variant={booking.status === "confirmed" ? "default" : "secondary"}
                              className={booking.status === "confirmed" ? "bg-primary" : ""}
                            >
                              {booking.status}
                            </Badge>
                            {(booking as any).paymentStatus && (
                              <Badge
                                variant={booking.paymentStatus === "paid" ? "default" : "destructive"}
                                className={booking.paymentStatus === "paid" ? "bg-green-500" : ""}
                              >
                                {booking.paymentStatus === "paid" ? "Paid" : "Pending Payment"}
                              </Badge>
                            )}
                            {(booking as any).amount && (
                              <Badge variant="outline">
                                ${((booking as any).amount || 0).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {booking.station?.address || 'Address not available'}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(booking.startTime)}
                            </div>
                            <div>Duration: {getDuration(booking.startTime, booking.endTime)}</div>
                            <div>{booking.vehicleInfo}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                          {(booking as any).paymentStatus === "pending" && booking.status === "confirmed" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handlePayBooking(booking)}
                              className="shadow-electric flex items-center gap-1"
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay Now ${((booking as any).amount || 0).toFixed(2)}
                            </Button>
                          )}
                          {booking.status === "confirmed" && (booking as any).paymentStatus === "paid" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleCompleteBooking(booking._id)}
                                className="shadow-electric"
                              >
                                Complete
                              </Button>
                            </>
                          )}
                          {booking.status === "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReviewBooking(booking)}
                              className="flex items-center gap-1"
                            >
                              <Star className="w-4 h-4" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold">{user?.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  {user?.phone && (
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsEditProfileModalOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full shadow-electric">
                  <Link to="/stations">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Stations
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    loadBookings();
                    setTimeout(() => {
                      const bookingsElement = document.querySelector('[data-bookings-section]');
                      if (bookingsElement) {
                        bookingsElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center',
                          inline: 'nearest'
                        });
                        toast({
                          title: "Viewing Bookings",
                          description: `You have ${bookings.length} total booking${bookings.length !== 1 ? 's' : ''}.`,
                        });
                      }
                    }, 100);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Bookings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const completedBookings = bookings.filter(b => b.status === 'completed');
                    if (completedBookings.length === 0) {
                      toast({
                        title: "No Charging History",
                        description: "You haven't completed any charging sessions yet.",
                      });
                    } else {
                      toast({
                        title: "Charging History",
                        description: `You have ${completedBookings.length} completed charging sessions.`,
                      });
                    }
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Charging History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <ReviewModal
          booking={selectedBooking}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          onReviewCreated={handleReviewCreated}
        />

        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPaymentBooking(null);
          }}
          bookingId={selectedPaymentBooking?._id || ""}
          amount={selectedPaymentBooking?.amount || 0}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default Dashboard;