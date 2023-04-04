import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
import './App.css'
import dayjs, { Dayjs } from 'dayjs'
import weekday from 'dayjs/plugin/weekday';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { chooseRandom, classes, randBetween, split, times } from './utils';
import { deserialize_daysArray, load_daysArray, load_includingFloating, load_startDate, persist_daysArray, persist_includingFloating, persist_startDate, serialize_daysArray } from './State';
import IDaysArray from './DaysArray';
import { navigateTable } from './tables';
import { downloadFile, readFile } from './files';

dayjs.extend(weekday);
dayjs.extend(advancedFormat);

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
    if (hours === 0) {
      // Remove the item if unsetting it
      // https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
      clone.splice(index, 1);
    } else {
      clone[index].hours = hours;
    }
    return clone;
  }

  return [... data, { day_iso: dayIso, hours: hours }];
}

function pop_location(pos: {x: number; y: number; }) {
  if (!document.body.animate) {
    // Don't do this if we don't support animations
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    // Don't animate if you prefer less motion.
    // https://web.dev/prefers-reduced-motion/
    return;
  }

  const emoji = chooseRandom([
    "😀", "🥰", "🌴", "🎉", "✈️", "🛳️", "🛵", "⛱️",
    "🪂", "🗺️", "🏝️", "🍍", "😴"]);

  // https://css-tricks.com/playing-with-particles-using-the-web-animations-api/
  const createParticle = (pos: {x: number; y: number}) => {
    const particle = document.createElement("div");
    const size = Math.floor(randBetween(25, 5));
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.className = "particle";
    particle.innerText = emoji;
    // particle.style.background = `hsl(${randBetween(90, 180)}, 70%, 60%)`;
    const destination = {
      x: pos.x + ((Math.random() > 0.5) 
        ? randBetween(20, 50)
        : randBetween(-20, -50)),
      y: pos.y + ((Math.random() > 0.5) 
        ? randBetween(20, 50)
        : randBetween(-20, -50)),
    };

    const animation = particle.animate([
      {
        // Set the origin position of the particle
        // We offset the particle with half its size to center it around the mouse
        transform: `translate(${pos.x - (size / 2)}px, ${pos.y - (size / 2)}px)`,
        opacity: 1
      },
      {
        // We define the final coordinates as the second keyframe
        transform: `translate(${destination.x}px, ${destination.y}px)`,
        opacity: 0
      }
    ],
    {
      duration: randBetween(1000, 1500),
      easing: 'cubic-bezier(0, .9, .57, 1)',
      // Delay every particle with a random value from 0ms to 200ms
      delay: Math.random() * 200
    });
    animation.onfinish = () => {
      particle.remove();
    };
    document.body.appendChild(particle);
  };

  const particleCount = 20;
  times(particleCount, () => createParticle(pos));
}

interface IMonthTableProps {
  month: string;
  days: dayjs.Dayjs[];
  isDayOff: (d: dayjs.Dayjs) => boolean;
  isDayAlreadyOff: (d: dayjs.Dayjs) => boolean;
  onClick: (d: dayjs.Dayjs, pos: { x: number; y: number; }) => void;
}

function MonthTable(props: IMonthTableProps) {
  const findFirstSelectableDateInRange = (days: dayjs.Dayjs[]): dayjs.Dayjs => {
    let currentDayIndex = 0;
    while(currentDayIndex < days.length)
    {
      const currentDay = days[currentDayIndex];
      if (!props.isDayAlreadyOff(currentDay))
      {
        return currentDay;
      }

      currentDayIndex++;
    }

    throw new Error(`No available dates in ${days}`);
  };

  const [focusedDate, setFocusedDate] = useState<dayjs.Dayjs>(findFirstSelectableDateInRange(props.days));

  const daysFromStartOfWeek = props.days[0].weekday();
  const daysFromEndOfWeek = 7 - props.days[props.days.length - 1].weekday();

  const weeks = split(7, [
    ... times(daysFromStartOfWeek, () => null),
    ... props.days,
    ... times(daysFromEndOfWeek, () => null)
  ]);

  const isButton = (el: Element): el is HTMLButtonElement => {
    return el.tagName === "BUTTON";
  };

  const navigate = (el: HTMLButtonElement, dir: { x: number, y: number}): HTMLButtonElement | null => {
    if (dir.x && dir.y) {
      // TODO: unhandled.
      return null;
    }

    let cell = navigateTable(el.parentElement as HTMLTableCellElement, dir);
    // console.log(cell);

    let focusElement: HTMLButtonElement | null = null;
    if (cell) {
      const child = cell.firstElementChild;
      if (child && isButton(child)) {
        focusElement = child;
      }
    }

    if (focusElement) {
      focusElement.focus();
      return focusElement;
    } else {
      // We failed to navigate
      return null;
    }
  };

  const getDirection = (key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown") => {
    if (key === "ArrowLeft") {
      return { x: -1, y: 0};
    } else if (key === "ArrowRight") {
      return { x: 1, y: 0};
    } else if (key === "ArrowUp") {
      return { x: 0, y: -1};
    } else if (key === "ArrowDown") {
      return { x: 0, y: 1};
    }

    throw new Error(`Invalid key ${key}`);
  };

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // console.log(e.key);
    if (e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown") {
      let navigationTo = navigate(e.currentTarget, getDirection(e.key));
      if (navigationTo) {
        setFocusedDate(dayjs(navigationTo.dataset["day"], "YYYY-MM-DD"));
        e.preventDefault();
      }
    }
  };

  return <table className='max-w-xs table-auto border-spacing-0 border-collapse'>
    {/* TODO: arrow keys, home and end, tab support */}
    {/* TODO: Support shift-click! */}
    {/* TODO: show one month before and after year? */}
    {/* TODO: explain holidays */}
    <caption className='font-bold text-left mt-2'>
      {props.month}
    </caption>
    <thead>
      <tr className=''>
        {times(7, (i) => <th className='font-normal p-3 px-4 text-right text-deemphasis' title={dayjs().weekday(i).format("dddd")} aria-label={dayjs().weekday(i).format("dddd")}>{dayjs().weekday(i).format("dd")}</th>)}
      </tr>
    </thead>
    <tbody>
      {weeks.map((w, wIndex) => {
        let didPrintFirstDate = false;
        return <tr className=''>
          {w.map((d) => {
            if (d === null) {
              return <td>&nbsp;</td>;
            }

            const hasOff = props.isDayOff(d);
            const isAutomatic = props.isDayAlreadyOff(d);
            const isToday = d.isSame(dayjs(), "day");
            const isLastFocused = focusedDate.isSame(d, "day");
            return <td className='p-0 m-0'>
                <button
                  onKeyDown={onButtonKeyDown}
                  className={classes([
                    'text-right rounded-none m-0 w-full p-3 px-4 border-2',
                    (hasOff) ? "bg-green hover:bg-sky-400 hover:dark:bg-sky-600" : "hover:bg-sky-200 hover:dark:bg-sky-700",
                    (isAutomatic) ? "bg-zinc-100 dark:bg-zinc-900 hover:bg-sky-100 dark:hover:bg-sky-900 text-deemphasis" : null,
                    (hasOff || isAutomatic) ? null : "bg-inherit",
                    (isToday) ? "font-bold" : "border-transparent",
                    (isToday && hasOff) ? "border-emerald-500 hover:border-sky-700" : null,
                    (isToday && !hasOff) ? "border-slate-300 hover:border-sky-400" : null,
                  ])}
                  data-day={d.format("YYYY-MM-DD")}
                  aria-disabled={isAutomatic}
                  aria-label={[
                    d.format("Do"),
                    (hasOff) ? "Vacation" : undefined,
                    (isAutomatic) ? "Holiday" : undefined,
                  ].join(" ")}
                  tabIndex={(isLastFocused) ? 0 : -1}
                  onClick={(e) => props.onClick(d, {x: e.clientX, y: e.clientY }) }>
                    {d.date()}
                </button>
              </td>;
          })}
        </tr>;
      })}
    </tbody>
  </table>;
}

function App() {
  const [data, setData] = useState<IDaysArray>(load_daysArray());
  const jsonData = serialize_daysArray(data);
  const [backup, setBackup] = useState<IDaysArray | null>(null);
  const [viewDate, setViewDate] = useState(dayjs().startOf("year"));
  useEffect(() => {
    persist_daysArray(data);
  }, [data]);
  const [startDate, setStartDate] = useState(load_startDate());
  useEffect(() => {
    persist_startDate(startDate);
  }, [startDate]);
  const [includeFloating, setIncludingFloating] = useState(load_includingFloating());
  useEffect(() => {
    persist_includingFloating(includeFloating);
  }, [includeFloating]);

  // TODO:
  const currentYear = viewDate.year();

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
    return day.day() === 0 || day.day() === 6;
  }

  const known_holidays = [
    dayjs("2023-01-02", "YYYY-MM-DD"),
    dayjs("2023-01-16", "YYYY-MM-DD"),
    dayjs("2023-02-20", "YYYY-MM-DD"),
    dayjs("2023-05-29", "YYYY-MM-DD"),
    dayjs("2023-07-04", "YYYY-MM-DD"),
    dayjs("2023-09-04", "YYYY-MM-DD"),
    dayjs("2023-11-23", "YYYY-MM-DD"),
    dayjs("2023-11-24", "YYYY-MM-DD"),
    dayjs("2023-12-25", "YYYY-MM-DD"),
    dayjs("2023-12-26", "YYYY-MM-DD"),
  ];

  const doesYearHaveHolidays = (year: number): boolean => {
    const found = known_holidays.find((h) => h.year() === year);
    return !!found;
  };

  // https://holidays.microsoft.com/
  const isHoliday = (day: dayjs.Dayjs): boolean => {
    // TODO.
    const isKnownHoliday = !!known_holidays.find((d) => d.isSame(day, "day"));
    return isKnownHoliday;
  }

  const isAlreadyOff = (day: dayjs.Dayjs): boolean => {
    return isWeekend(day) || isHoliday(day);
  }

  const isDayOff = (day: dayjs.Dayjs): boolean => {
    return get_time_off(data, day) !== 0;
  }

  const usedHours = data.reduce((acc, v) => { return acc + v.hours }, 0);
  const usedDays = (usedHours / 8);

  const getYearsWorked = (startDate: dayjs.Dayjs) => { return dayjs().diff(startDate, "year"); };
  const getTotalHours = (startDate: dayjs.Dayjs) => {
    const years = getYearsWorked(startDate);
    if (years < 7) {
      return 120;
    } else if (years < 13) {
      return 160;
    } else {
      return 200;
    }
  };
  const totalHours = getTotalHours(dayjs(startDate, "YYYY-MM")) + (includeFloating ? 2 * 8: 0);
  const totalDays = (totalHours / 8);
  const remainingHours = totalHours - usedHours;
  const remainingDays = (remainingHours / 8);

  const onDownload = () => {
    const indentedData = serialize_daysArray(data, 4);
    downloadFile("export.json", indentedData);
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      // TODO: clearer error handling.
      return;
    }

    const file = e.target.files[0];
    const content = await readFile(file);
    setData(deserialize_daysArray(content));
  };

  return (
    <>
      <div className='md:grid gap-4 md:grid-cols-[minmax(min-content,_30%)_1fr]'>
          <div>
            <div className='md:fixed top-10 flex flex-col gap-4'>
              <h1 className="text-3xl font-bold">TAR2-D2</h1>
              <p>A simple vacation tracker 🤖</p>

              <div>
                <button
                  title="Previous year"
                  onClick={() => setViewDate(viewDate.add(-1, "year"))}>
                    &larr;
                </button>
                <label>
                  Year:
                  <input type="year" value={viewDate.format("YYYY")} onChange={(e) => setViewDate(dayjs(e.target.value, "YYYY"))} />
                </label>
                <button
                  title="Next year"
                  onClick={() => setViewDate(viewDate.add(1, "year"))}>
                    &rarr;
                </button>
                {(doesYearHaveHolidays(viewDate.year())) 
                  ? null
                  : <div className='bg-yellow-300 dark:bg-yellow-800 p-2 my-2'>I don't know about holidays for {viewDate.year()}!</div>
                }
              </div>

              <div>
                <label>
                  Start date:
                  <input type="month" value={startDate.format("YYYY-MM")} onChange={(e) => setStartDate(dayjs(e.target.value, "YYYY-MM"))} />
                </label>
                <span className='text-slate-400'>&rarr; {getYearsWorked(startDate)} years</span>
              </div>

              <table>
                {/* <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>Days</th>
                    <th>Hours</th>
                  </tr>
                </thead> */}
                <tbody>
                  <tr>
                    <td className='text-right'>Used</td>
                    <td className='text-right'>{usedDays.toFixed(2)} days</td>
                    <td className="text-slate-400">{usedHours} hrs</td>
                  </tr>
                  <tr>
                    <td className='text-right'>Remaining</td>
                    <td className={classes([
                      "text-right",
                      (remainingHours < 0) ? "bg-red" : null,
                      (remainingHours > 0) ? "bg-green" : null,
                    ])}>{remainingDays.toFixed(2)} days</td>
                    <td className={classes([
                      "text-slate-400",
                      (remainingHours < 0) ? "bg-red" : null,
                      (remainingHours > 0) ? "bg-green" : null,
                    ])}>{remainingHours} hrs</td>
                  </tr>
                  <tr>
                    <td className='text-slate-400 text-right'>Total</td>
                    <td className='text-slate-400 text-right'>{totalDays.toFixed(2)} days</td>
                    <td className="text-slate-400">{totalHours} hrs</td>
                  </tr>
                </tbody>
              </table>

              <label className='cursor-pointer'>
                <input type="checkbox"
                  checked={includeFloating}
                  onChange={(e) => {
                    setIncludingFloating(e.target.checked);
                  }} />
                Include floating holidays <span className='text-slate-400'>(2 days/16 hours)</span>
              </label>

              <div className='flex gap-2'>
                <label htmlFor='import' className='labelButton grow'>
                  Load
                </label>
                <input id="import" type="file" accept='application/json' className='hidden' onChange={handleImport}/>
                <button onClick={onDownload} className="grow">Save</button>
              </div>

              <details className='w-full'>
                <summary className='font-bold'>Advanced settings</summary>

                <label className='font-bold'>Raw JSON</label>

                <textarea value={jsonData} className="w-10/12" rows={10} />

                <button onClick={() => {
                  const hasBackup = backup !== null;
                  if (hasBackup) {
                    setData(backup);

                    // TODO: backup any NEW data since the reset.
                    setBackup(null);
                  } else {
                    setBackup(data);
                    setData([]);
                  }
                }}>{(backup === null) ? "Reset data" : "Undo reset"}</button>
              </details>
            </div>
          </div>

        <div className=''>
          <h2 className='font-bold text-3xl my-3'>{viewDate.year()}</h2>
          {/* <button>Reset {viewDate.year()}</button> */}

          {getDaysForYearByMonth(currentYear).map((m) => <MonthTable
            month={m.monthD.format("MMMM")}
            days={m.days}
            isDayOff={isDayOff}
            isDayAlreadyOff={isAlreadyOff}
            onClick={(d, pos) => {
              if (!isAlreadyOff(d)) {
                if (isDayOff(d)) {
                  setData(set_time_off(data, d, 0));
                } else {
                  pop_location(pos);
                  setData(set_time_off(data, d, 8));
                }
              }
            }}
            />)}
        </div>
      </div>

      <hr />

      <h2 className='font-bold'>Known vacations</h2>
      <ul>
        {known_holidays.map((d) => {
          return <li>{d.format("MMMM D, YYYY")}</li>;
        })}
      </ul>

      <h2>Accrual rates</h2>
      <p className='text-slate-400'>(via <a href="https://microsoft.sharepoint.com/sites/HRweb/SitePages/FAQ_DTO.aspx">Discretionary Time Off (DTO) FAQ</a>)</p>
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
      {/* // Example: You are a full-time salaried employee, reaching your six-year
      // anniversary November 1, 2022. The next calendar day after the six-year
      // anniversary, November 2, 2022 (first day in your seventh year of
      // employment), you will move to the accrual rate of 6.67 hours per pay
      // period. This new accrual rate will be in effect for the last four pay
      // periods of 2022 (11/15, 11/30, 12/15, and 12/31). You would then be able to
      // carry over up to 160 hours of vacation into 2023. */}
      <hr />
      <footer className='my-3'>
        By <a href="https://ben.stolovitz.com">Ben Stolovitz</a> | <a href="https://github.com/citelao/tar2d2">Source code</a> (Contributions welcome!)
      </footer>
    </>
  );
}

export default App
