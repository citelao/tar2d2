import { z } from "zod";

export const DaysArray = z.array(z.object({
    day_iso: z.string(),
    hours: z.number()
}));

type IDaysArray = z.infer<typeof DaysArray>;

export default IDaysArray;