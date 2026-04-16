import { FixedDestination } from "@/src/services/fixed-destination.service";
import { paymentStatus } from "../enum/payment.enum";
import { travelTypeValues } from "../enum/travel.enum";
import { User } from "./auth.interface";
import { paymentMethod } from "../enum/payment-method.enum";

interface Location {
  latitude: number | null;
  longitude: number | null;
  address?: string | undefined;
}

export interface BookingData {
  countryCode: string;
  carType: any;
  vehicleType: string;
  programedTo: any;
  destination: Location;
  currentLocation: Location;
  fullName: string;
  contact: string;
  roomNumber: string;
  numberOfPassengers: number;
  numberOfLuggages: number;
  reducedMobility: boolean;
  flightNumber: string;
  airline: string;
  type: string;
  time: number | undefined;
  distance: number | undefined;
  price: number,
  passengerCommission: number,
  id: string;
  hopperId: string;
  fixedDestinationId?: string;
  chargeToRoom?: boolean;
  paymentMethod: paymentMethod;
  companyId?: string | null;
}

export interface BookingResponse {
  paymentStatus: paymentStatus;
  from: From;
  to: From;
  distance: number;
  time: number;
  type: travelTypeValues;
  programedTo: Date;
  status: string;
  passengerName: string;
  passengerContact: string;
  passengerRoom: string;
  totalPassengers: string;
  totalSuitCases: string;
  passengerAirline: string;
  passengerFligth: string;
  passenger: Passenger;
  price: number;
  vehicleType: string;
  id: string;
  passengerCommission: number,
  passengerContactCountryCode: string;
  passengerCommission: number,
  tollsCommission: number,
  hopper: User,
  appCommission: number;
  reducedMobility: boolean;
  paymentGateway: string;
  fixedDestination: FixedDestination;
  paymentMethod: paymentMethod;
  companyId?:string | null;
}

export interface From {
  lat: number;
  lng: number;
  address: string;
}

export interface Passenger {
  id: string;
}

export interface BookingPagination {
  pagination: {
    total: number,
    page: number,
    totalPages: number,
    itemsPerPage: number,
    order: Order
  },
  result: BookingResponse[]
}

export type Order = {
  ASC: string;
  DESC: string;
}

export interface BookingResponseNotification {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  from: Location;
  to: Location;
  distance: number;
  time: number;
  type: string;
  programedTo: Date;
  status: string;
  passengerName: string;
  passengerContact: string;
  passengerContactCountryCode: string;
  passengerRoom: string;
  totalPassengers: string;
  totalSuitCases: string;
  passengerAirline: string;
  passengerFligth: string;
  passenger: User;
  passengerCommission: number;
  passengerCommissionsPaid: boolean;
  hopper: User;
  hopperCommission: number;
  hopperCommissionsPaid: boolean;
  price: number;
  tolls: number | null;
  paymentStatus: string;
  vehicleType: string;
}


export interface FrecuentAddressInterface {
  mostFrequentFrom: MostFrequent[];
  mostFrequentTo: MostFrequent[];
}

export interface MostFrequent {
  address: string;
  lat: string;
  lng: string;
  count: string;
}


export interface CommissionData {
  month: {
    totalCommission: number;
  };
  week: {
    totalCommission: any;
    weekStart: string;
    weekEnd: string;
    totalPassengerCommission: number;
    totalPassengerCommission: number;
  }[];
}

export interface OrderBook {
  id: string;
  type: 'point' | string;
  processing_mode: 'automatic' | string;
  external_reference: string;
  description: string;
  country_code: string;
  user_id: string;
  status: 'created' | string;
  status_detail: 'created' | string;
  currency: string;
  created_date: string;
  last_updated_date: string;
  integration_data: {
    application_id: string;
  };
  transactions: {
    payments: {
      id: string;
      amount: string;
      status: 'created' | string;
    }[];
  };
  config: {
    point: {
      terminal_id: string;
      print_on_terminal: 'seller_ticket' | string;
    };
  };
}
