import { useDLSO } from './hooks/useDLSO';
import { Header } from './components/Header';
import { SliderPanel } from './components/SliderPanel';
import { SatisfactionChart } from './components/SatisfactionChart';
import { TotalChart } from './components/TotalChart';
import { ScoreCard } from './components/ScoreCard';

function App() {
  const { state, curves, optimals, scores, optimalTotal, setActivity, resetToOptimal } = useDLSO();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left column: controls */}
          <div className="space-y-6">
            <SliderPanel
              values={state}
              optimals={optimals}
              onChange={setActivity}
              onReset={resetToOptimal}
            />
            <ScoreCard current={scores.total} optimal={optimalTotal} />
          </div>

          {/* Right column: charts */}
          <div className="space-y-6">
            <SatisfactionChart
              label="Effort"
              data={curves.effort}
              currentValue={state.effort}
              optimalValue={optimals.effort}
              color="#3b82f6"
              currentSatisfaction={scores.effort}
            />
            <SatisfactionChart
              label="Sleep"
              data={curves.sleep}
              currentValue={state.sleep}
              optimalValue={optimals.sleep}
              color="#6366f1"
              currentSatisfaction={scores.sleep}
            />
            <SatisfactionChart
              label="Leisure"
              data={curves.leisure}
              currentValue={state.leisure}
              optimalValue={optimals.leisure}
              color="#f59e0b"
              currentSatisfaction={scores.leisure}
            />
            <TotalChart scores={scores} />
          </div>
        </div>

        <footer className="text-center text-xs text-slate-600 mt-12">
          Based on the Daily Life Satisfaction Optimization model by Manan Bhargava
        </footer>
      </div>
    </div>
  );
}

export default App;
