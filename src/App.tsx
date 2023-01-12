import { useState } from 'react'
// import reactLogo from './assets/react.svg'
import './App.css'
import * as dayjs from 'dayjs'
import { times } from './utils';

function App() {
  const [count, setCount] = useState(0)

  // TODO:
  const currentYear = (new Date()).getFullYear();

  return (
    <>
      <h1 className="text-3xl font-bold underline">Porta-TAR calculator</h1>
      <p>Yo, I heard you like tracking your vacation</p>

      <label>
        Start date:
        <input type="month" />
      </label>

      <label>
        Year:
        <input type="year" value={currentYear} readOnly={true} />
      </label>

      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => {
        const month =dayjs().month(m); 
        const days = month.daysInMonth();
        const mapper = times(days, (i) => <div>{i}</div>);
        return <div>
          <b>{month.format("MMMM")}</b>
          <div className="flex gap-2">
            {mapper}
          </div>
        </div>;
      })}

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
