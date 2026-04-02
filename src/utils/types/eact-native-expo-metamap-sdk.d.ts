declare module "react-native-expo-metamap-sdk" {
    export interface MetaMapRNSdk {
        showFlow(clientId: string, flowId: string, metadata: object): void;
    }

    export const MetaMapRNSdk: MetaMapRNSdk;
}
