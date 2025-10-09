import { jsonWithCors } from "~/utils/cors";

export const GET = () => jsonWithCors({
  success: true,
  data: {
    documentation: "https://github.com/Vexcited/WebLimogesTimetableIUTCS/blob/main/README.md",
    years: ["A1", "A2", "A3"]
  }
}, 200);
