export interface SignInResponse {
  access_token: string;
  refresh_token: string;
  role: string
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface UserDocument {
  backDriverLicense: string | null;
  backRut: string | null;
  circulationPermit: string | null;
  created_at: string;
  deleted_at: string | null;
  driverResume: string | null;
  frontDriverLicense: string | null;
  frontRut: string | null;
  id: string;
  seremiDecree: string | null;
  updated_at: string;
  vehiclePictures: string[] | null;
  identificationPictures: string[] | null;
  passengerInsurance: string | null;
  userContract: string | null;
}

export interface UserDocumentsPayload {
  frontRut: null;
  backRut: null;
  circulationPermit: null | DocumentPayload[];
  seremiDecree: null | DocumentPayload[];
  frontDriverLicense: null | DocumentPayload[];
  backDriverLicense: null | DocumentPayload[];
  driverResume: null | DocumentPayload[];
  vehiclePictures: DocumentPayload[];
  identificationPictures: DocumentPayload[];
  passengerInsurance: DocumentPayload[];
}

type DocumentPayload = {
  uri: string;
  name: string;
  type: string
}

export interface CreateUserResponse {
  bank_account: string;
  bank_account_type: string;
  bank_name: string;
  firstName: string;
  home_address: string;
  lastName: string;
  phone: string;
  rut: string;
}

interface HomeAddress {
  lat: number | string;
  lng: number | string;
  address: string;
}

interface HotelLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface BankName {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: null;
  name: string;
  image?: string;
  country?: string;
}


export interface UserInfo {
  firstName?: string;
  lastName?: string;
  rut?: string;
  phone?: string;
  home_address?: HomeAddress;
  bank_account_holder?: string;
  bank_account_rut?: string;
  bank_name?: BankName;
  bank_account?: string;
  bank_account_type?: string;
  hotel_name?: string;
  user_code?: string;
  reference_code?: string;
  hotel_location?: HotelLocation;
  profilePic?: string;
  countryCode?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: "USER_HOPPER" | string;
  userInfo: UserInfo;
  userNotificationToken?: string | null;
  isActive: boolean;
  isVerified: boolean;
  status: string;
  company: Company;
}

export interface Company {
  id: string;
  accountChargeEnabled: boolean;
}

export interface VehicleUser {
  type: string,
  passengers: string,
  accessibility: boolean,
  suitcases: string,
  specialLuggage: boolean
}

export interface OnboardingPayload {
  email: string;
  password: string;
  role: "USER_HOPPER" | "USER_HOPPY" | "ANOTHER_ROLE" | "USER_PASSENGER";
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  countryCode: string;
  user_address: {
    address: string;
    latitude: number;
    longitude: number;
  };
  bank_name: string;
  bank_account: string;
  bank_account_type: string;
  bank_account_rut: string;
  bank_account_number: string;
  bank_account_holder: string;
  reference_code: string;
  hotel_address: {
    hotel_name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  birthdate: string;
  vehicleDocs: {
    vehicle_picture: any,
    identification_picture: any,
    seremi: any,
    curriculum_vitae: any,
    permission: any,
    secure: any,
  },
  vehicleData: {
    type: any;
    passengers: any,
    luggageSpace: any,
    specialLuggage: any,
    accessibility: any,
  }
}
