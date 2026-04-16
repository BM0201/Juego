import { useMemo, useState } from 'react';

const CENTURIES = [
  { label: '1700s', start: 1700, end: 1799 },
  { label: '1800s', start: 1800, end: 1899 },
  { label: '1900s', start: 1900, end: 1999 },
  { label: '2000s', start: 2000, end: 2099 },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function BirthSetup({ onSubmit }) {
  const [centuryIndex, setCenturyIndex] = useState(1);
  const [year, setYear] = useState(1890);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  const years = useMemo(() => {
    const selectedCentury = CENTURIES[centuryIndex];
    const values = [];
    for (let y = selectedCentury.start; y <= selectedCentury.end; y += 1) values.push(y);
    return values;
  }, [centuryIndex]);

  const changeCentury = (index) => {
    setCenturyIndex(index);
    setYear(CENTURIES[index].start);
  };

  return (
    <section className="card">
      <h2>Elige fecha de nacimiento</h2>
      <div className="form-grid">
        <label>
          Siglo/rango
          <select value={centuryIndex} onChange={(e) => changeCentury(Number(e.target.value))}>
            {CENTURIES.map((range, index) => <option key={range.label} value={index}>{range.label}</option>)}
          </select>
        </label>
        <label>
          Año
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>
          Mes
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
        <label>
          Día
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>
      <button onClick={() => onSubmit({ year, month, day, century: CENTURIES[centuryIndex].label })}>Continuar</button>
    </section>
  );
}

export default BirthSetup;
