import { createContext } from "react";

export const AppContext = createContext({
  coordinationServers: [],
  setCoordinationServers: () => {},
  coordinationServer: "",
  setCoordinationServer: () => {},

  dataServers: [],
  setDataServers: () => {},
  dataServer: "",
  setDataServer: () => {},
  
  payerServers: [],
  setPayerServers: () => {},
  payerServer: "",
  setPayerServer: () => {},

  requester: "",
  setRequester: () => {},
  contributor: "",
  setContributor: () => {},

  accountSettingsError: false,
  setAccountSettingsError: () => {},

});

