import { Controller, Sse } from '@nestjs/common';
import { Console } from 'console';
import { Observable, interval, map } from 'rxjs';

interface MessageEvent {
  data: string | object;
}

@Controller('notification')
export class NotificationController {
  private savingsData = [
    { id: 1, deadline: new Date('2023-09-27T00:00:00.000Z') },
    { id: 2, deadline: new Date('2023-09-27T00:00:00.000Z') },
  ];

  @Sse('event')
  sendEvent1(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map(() => {
        const currentDate = new Date();

        const nearDeadlines = this.savingsData.filter((savings) => {
          // Calculate the difference in days between the deadline and the current date
          const timeDifference =
            savings.deadline.getTime() - currentDate.getTime();
          const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

          // Check if the deadline is within two days or one day
          return daysDifference === 2 || daysDifference === 1;
        });

        if (nearDeadlines.length > 0) {
          return { data: { nearDeadlines: nearDeadlines } };
        }

        return { data: { hello: 'world' } };
      }),
    );
  }

  @Sse('sse')
  sendEvent2(): Observable<MessageEvent> {
    return new Observable((observer) => {
      const sendEvent = () => {
        console.log('Data: ', this.savingsData[0].deadline.getDate());
        const now = new Date();

        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        console.log('Today: ', today);
        console.log(this.savingsData[0].deadline.getDate() - today.getDate());

        // Check savings data for deadlines
        this.savingsData.forEach((savings) => {
          const deadline = savings.deadline;
          const remainingDays = Math.floor(
            deadline.getDate() - today.getDate(),
          );

          console.log('Remaining Days ', remainingDays);
          // Send an event message when there are 1 or 2 days remaining
          if (remainingDays === 1 || remainingDays === 2) {
            observer.next({
              data: {
                message: `Deadline approaching for savings with ${remainingDays} days remaining`,
              },
            });
          }
        });
      };

      // Use interval to send events once a day (adjust the interval as needed)
      const intervalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const eventInterval = setInterval(sendEvent, intervalTime);

      // Send the initial event immediately
      sendEvent();

      // Cleanup when the client disconnects
      observer.add(() => {
        clearInterval(eventInterval);
      });
    });
  }
}
