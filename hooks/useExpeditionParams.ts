import { useRouter } from 'next/dist/client/router';

type ExpeditionParams = {
  schule: string | string[];
  gruppe: string | string[];
};

export const useExpeditionParams = (): ExpeditionParams => {
  const router = useRouter();

  const { schule, gruppe } = router.query;

  return { schule, gruppe };
};
