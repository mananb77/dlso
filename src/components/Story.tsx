export function Story() {
  return (
    <section className="bg-slate-900 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">The Story Behind DLSO</h2>
      <div className="text-sm text-slate-300 leading-relaxed space-y-4">
        <p>
          The clock struck two hours past midnight as I frantically scrambled to finish the
          brute-force solution to the Eight-Queens problem and debug the K-means object tracking
          machine-learning algorithm in APCS. As much as I love solving problems in Math and
          Computer Science, my 13–18hr day is split between academics and collaborating with at
          least 2–4 different teams per day—something I thoroughly enjoy. However, upon realizing
          that my hectic junior year schedule was deteriorating my health, I felt the burning desire
          to create a means of optimizing my own time and maximize my life satisfaction efficiently.
          The idea excited me!
        </p>
        <p>
          For me, satisfaction is a function of my effort, growth, being happy, and doing activities
          to boost health. Ruminating on data of my sleep and working hours since freshman year, I
          created the <strong className="text-slate-100">Daily Life Satisfaction Optimization Model (DLSO)</strong> using
          algebraic equations.
        </p>
        <p>
          It maximizes Satisfaction, a weighted function of the decision variables Effort, Sleep, and
          Leisure (represented with x, y, z) as the hours spent per activity. I computed overall
          satisfaction as the output, incorporating the tradeoffs reflected in my preferences while
          meeting the time constraint of 24 hours/day.
        </p>
        <p>I graphed the 9th-degree Maclaurin Series equations of best fit:</p>
        <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400 space-y-1 overflow-x-auto">
          <p>S(effort)&nbsp; = (1.29e-7)x<sup>9</sup> + (-1.59e-5)x<sup>8</sup> + … + (312.79)x + (-283.46)</p>
          <p>S(leisure) = (5.03e-9)y<sup>9</sup> + (7.67e-7)y<sup>8</sup> + … + (-5.24)y + (2.58)</p>
          <p>S(sleep)&nbsp;&nbsp; = (-4.73e-9)z<sup>9</sup> + (-4.08e-8)z<sup>8</sup> + … + (2.12)z + (-0.12)</p>
        </div>
        <p>Solving my optimization problem:</p>
        <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400">
          Total = (10/24)·S(Effort) + (8/24)·S(Sleep) + (6/24)·S(Leisure)
        </div>
        <p>The solution reflects 3 general trends for the optimum peaks:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li><strong className="text-blue-400">Effort: 8.7h</strong>, but also 15.0h at times when working on extensive projects.</li>
          <li><strong className="text-indigo-400">Sleep: 9.1h</strong></li>
          <li><strong className="text-amber-400">Leisure: 4.3h</strong>, but I'm okay with less!</li>
        </ul>
        <p>
          By applying the model, I raised my average sleep from 6 to 7.5 hours, improving
          productivity and overall happiness. Using creativity to blend mathematical concepts and
          logical thinking to transform problems from theory to practicality fuels my desire to
          learn.
        </p>
      </div>
    </section>
  );
}
