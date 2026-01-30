import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type StepInput = {
  timeRanges: {
    startTime: Date;
    endTime: Date;
  }[];
};

const stepCalculateBookingDateRange = createStep(
  "step-calculate-booking-date-range",
  async ({ timeRanges }: StepInput, { container }) => {
    console.log("timeRanges", timeRanges);

    function getBookingDateRange(
      timeRanges: { startTime: string | Date; endTime: string | Date }[],
    ) {
      const startTimes = timeRanges.map((r) => new Date(r.startTime).getTime());

      const endTimes = timeRanges.map((r) => new Date(r.endTime).getTime());

      return {
        finalStartTime: new Date(Math.min(...startTimes)),
        finalEndTime: new Date(Math.max(...endTimes)),
      };
    }

    const { finalStartTime: startDate, finalEndTime: endDate } =
      getBookingDateRange(timeRanges);
    console.log("startDate", startDate);
    console.log("endDate", endDate);

    return new StepResponse({
      startDate: startDate as Date,
      endDate: endDate as Date,
    });
  },
);

export default stepCalculateBookingDateRange;
