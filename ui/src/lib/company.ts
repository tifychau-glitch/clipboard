// Auto-bootstrap: fetches the first company or silently creates "Main" on first run.
// The user never sees or chooses a company — there's only one.

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

const DEFAULT_COMPANY_NAME = "Main";

export function useDefaultCompany() {
  return useQuery({
    queryKey: ["defaultCompany"],
    queryFn: async () => {
      const companies = await api.listCompanies();
      if (companies.length > 0) return companies[0];
      return api.createCompany({ name: DEFAULT_COMPANY_NAME });
    },
    staleTime: Infinity,
  });
}
