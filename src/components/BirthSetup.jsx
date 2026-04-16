import { useMemo, useState } from 'react';
import { CENTURIES } from '../data/gameData';

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function BirthSetup({ onSubmit }) {
  const [centuryIndex, setCenturyIndex] = useState(2);
  const [year, setYear] = useState(1950);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  const selectedCentury = CENTURIES[centuryIndex];

  const years = useMemo(() => {
    const list = [];
    for (let y = selectedCentury.start; y <= selectedCentury.end; y += 1) {
      list.push(y);
    }
    return list;
  }, [selectedCentury]);

  const handleCentury = (index) => {
    const range = CENTURIES[index];
    setCenturyIndex(index);
    setYear(range.start);
  };

  const handleContinue = () => {
    onSubmit({
      year,
      month,
      day,
      century: selectedCentury.label,
    });
  };

  return (
    <section className="card">
      <h2>Elige fecha de nacimiento</h2>
      <div className="form-grid">
        <label>
          Siglo/rango
          <select value={centuryIndex} onChange={(e) => handleCentury(Number(e.target.value))}>
            {CENTURIES.map((range, index) => (
              <option key={range.label} value={index}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Año
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Mes
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Día
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={handleContinue}>Continuar</button>
    </section>
  );
}

export default BirthSetup;
