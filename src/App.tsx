import { useState } from 'react'
// import reactLogo from './assets/react.svg'
import './App.css'
import * as dayjs from 'dayjs'
import * as weekday from 'dayjs/plugin/weekday';
import { classes, times } from './utils';

dayjs.extend(weekday);

type IDaysArray = Array<{
  day_iso: string;
  hours: number;
}>;

// interface IData {
//   days: IDaysArray;
// }

function get_time_off(data: IDaysArray, day: dayjs.Dayjs): number {
  const str = day.toISOString();
  const result = data.find((v) => v.day_iso === str);
  if (result)
  {
    return result.hours;
  }

  return 0;
}

function set_time_off(data: IDaysArray, day: dayjs.Dayjs, hours: number): IDaysArray {
  const dayIso = day.toISOString();
  const index = data.findIndex((v) => v.day_iso === dayIso);
  if (index !== -1) {
    const clone = [...data];
    clone[index].hours = hours;
  }
  return [... data, { day_iso: dayIso, hours: hours }];
}

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<IDaysArray>([]);

  // TODO:
  const currentYear = (new Date()).getFullYear();

  const getDaysForYearByMonth = (year: number): Array<{ month: number; monthD: dayjs.Dayjs, days: dayjs.Dayjs[] }> => {
    let day = dayjs(`${year}`, "YYYY");
    let yearArray = [];
    while (day.year() === year) {
      let currentMonth = day.month();
      let monthD = day;
      let days = [];
      while (day.month() === currentMonth) {
        days.push(day);
        day = day.add(1, 'day');
      }
      yearArray.push({
        month: currentMonth,
        monthD: monthD,
        days: days,
      });
    }
    return yearArray;
  };

  const isWeekend = (day: dayjs.Dayjs): boolean => {
    console.log(day.day())
    return day.day() === 0 || day.day() === 6;
  }

  // TODO: holidays
  
  const usedHours = data.reduce((acc, v) => { return acc + v.hours }, 0);
  const usedDays = (usedHours / 8);

  return (
    <>
      <h1 className="text-3xl font-bold">Porta-TAR calculator</h1>
      <p>Yo, I heard you like tracking your vacation</p>

      <label>
        Start date:
        <input type="month" />
      </label>

      <label>
        Year:
        <input type="year" value={currentYear} readOnly={true} />
      </label>

      <ul>
        <li>Hours off: {usedHours}</li>
        <li>Days off: {usedDays.toFixed(2)}</li>
      </ul>

      {
        getDaysForYearByMonth(currentYear).map((m) => {
          const daysFromStartOfWeek = m.days[0].weekday();
          const daysFromEndOfWeek = 7 - m.days[m.days.length - 1].weekday();
          return <div>
            <b>{m.monthD.format("MMMM")}</b>
            {/* TODO: actual table for accessibility */}
            <div className="flex flex-wrap max-w-xs">
              {times(7, (i) => <div className='flex-1 basis-1/7 p-2 text-right text-slate-300'>{dayjs().weekday(i).format("dd")}</div>)}
              {times(daysFromStartOfWeek, () => <div className='flex-1 basis-1/7 p-2' />)}
              {m.days.map((d) => {
                const hasOff = get_time_off(data, d) !== 0;
                const isWeekendV = isWeekend(d);
                return <div className={classes([
                    'flex-1 basis-1/7 p-2 text-right',
                    (hasOff) ? "bg-emerald-300 hover:bg-sky-400" : "hover:bg-sky-200",
                    (isWeekendV) ? "text-slate-300" : null,
                  ])}
                  onClick={() => {
                    if (!isWeekendV) {
                      if (hasOff) {
                        setData(set_time_off(data, d, 0));
                      } else {
                        setData(set_time_off(data, d, 8));
                      }
                    }
                  }}>{d.date()}</div>;
              })}
              {times(daysFromEndOfWeek, () => <div className='flex-1 basis-1/7 p-2' />)}
            </div>
          </div>;
        })
      }

      <hr />

      <h2>Accrual rates</h2>
      <p>(via <a href="https://microsoft.sharepoint.com/sites/HRweb/SitePages/FAQ_DTO.aspx">Discretionary Time Off (DTO) FAQ</a>)</p>
      <table>
        <thead>
          <tr>
            <th>Years of service</th>
            <th>Vacation grant rate (per pay period &times; 24)</th>
            <th>Maximum annual vacation granted</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0-6 yrs</td>
            <td>5.0 hrs</td>
            <td>15 days (120 hrs)</td>
          </tr>
          <tr>
            <td>7-12 yrs</td>
            <td>6.67 hrs</td>
            <td>20 days (160 hrs)</td>
          </tr>
          <tr>
            <td>13+ yrs</td>
            <td>8.34 hrs</td>
            <td>25 days (200 hrs)</td>
          </tr>
        </tbody>
      </table>
    </>
  );

  // Years of service | Vacation grant rate* (per pay period x 24) | Maximum  annual
  // vacation granted |
  // 0-6 years5.0 hours15 days (120 hours)7-12 years6.67 hours20
  // days (160 hours)13 or more years8.34 hours25 days (200 hours)
  //
  // Example: You are a full-time salaried employee, reaching your six-year
  // anniversary November 1, 2022. The next calendar day after the six-year
  // anniversary, November 2, 2022 (first day in your seventh year of
  // employment), you will move to the accrual rate of 6.67 hours per pay
  // period. This new accrual rate will be in effect for the last four pay
  // periods of 2022 (11/15, 11/30, 12/15, and 12/31). You would then be able to
  // carry over up to 160 hours of vacation into 2023.

  // return (
  //   <div className="App">
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src="/vite.svg" className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://reactjs.org" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </div>
  // )
}

export default App
