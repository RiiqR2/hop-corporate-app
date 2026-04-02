import { userRoles } from "../enum/role.enum";
import { notificationTypeValues } from "./booking.notification.interface";

export interface TravelNotificationResponse {
  result: TravelNotification[];
}

export interface TravelNotification {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type: notificationTypeValues;
  metadata: {
    payment: number;
    hopper: User;
    hoppy: User;
    travel: Travel;
  };
  alreadySeen: boolean;
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  status: "ACTIVE" | string;
  role: userRoles;
  userNotificationToken: string | null;
  mercadoPagoPOSId: string | null;
  cancelledReason: string;
  inactiveDate: string | null;
  userInfo: UserInfo;
  userVehicle: UserVehicle;
  userDocument: UserDocument;
}

export interface UserInfo {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  firstName: string;
  lastName: string;
  profilePic: string | null;
  countryCode: string;
  phone: string;
  rut: string;
  home_address: {
    lat: number;
    lng: number;
    address: string;
  };
  bank_account_isOwner: boolean;
  bank_account_holder: string;
  bank_account_rut: string;
  bank_account: string;
  bank_account_type: "current_account" | string;
  hotel_name: string;
  hotel_location: string | null;
  bank_name: {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
    image: string;
    country: string;
  };
}

export interface UserVehicle {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type: string;
  passengers: number;
  accessibility: boolean;
  suitcases: string;
  specialLuggage: boolean;
}

export interface UserDocument {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  frontRut: string | null;
  backRut: string | null;
  circulationPermit: string;
  seremiDecree: string;
  passengerInsurance: string;
  frontDriverLicense: string | null;
  backDriverLicense: string | null;
  driverResume: string;
  userContract: string | null;
  vehiclePictures: string[];
  identificationPictures: string[];
}

export interface Travel {
  id: string;
  price: number;
  from: Address;
  to: Address;
  type: string;
  vehicleType: string;
  hoppyCommission: number;
  totalPassengers: string;
  totalSuitCases: string;
  distance: number;
  passengerName: string;
  passengerContactCountryCode: string;
  passengerContact: string;
  passengerRoom: string;
  passengerFligth: string;
  programedTo: string;
  status: string;
}

export interface TravelLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Address {
  address: string;
  lat: number;
  lng: number;
}