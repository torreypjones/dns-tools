import { dnsLookup } from "../../../utils/dnsUtils";
import axios from "axios";
it("should perform a DNS lookup using dnsLookupand log the response", async () => {
  const data = await dnsLookup("ud.me", "A", "8.8.8.8");
  console.log(data);
});

it("should perform a DNS lookup using axios and log the response", async () => {
  try {
    const response = await axios.get("/api/dns-lookup", {
      params: { domain: "ud.me", recordType: "A", nameserver: "8.8.8.8" },
    });
    console.log("this is from teh actual axios call");
    console.log(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw error;
  }
});
