import { useRouter } from 'next/dist/client/router';

type LerneinheitParams = {
  schule: string | string[];
};

export const useLerneinheitParams = (): LerneinheitParams => {
  const router = useRouter();

  const { schule } = router.query;

  return { schule };
};
