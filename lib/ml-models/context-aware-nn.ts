export class ContextAwareNN {
  predict(matchData: any, context: any): any {
    const features = this.buildFeatureVector(matchData, context);
    const output = this.forwardPass(features);
    
    return {
      model: 'Context-Aware NN',
      outcome: this.interpretOutput(output),
      confidence: Math.max(...output) * 100,
      probabilities: {
        home: output[0],
        draw: output[1],
        away: output[2],
      },
    };
  }

  private buildFeatureVector(matchData: any, context: any): number[] {
    return [
      this.normalizeForm(matchData.homeTeam?.form),
      this.normalizeForm(matchData.awayTeam?.form),
      this.normalizeGoals(matchData.homeTeam?.goalsFor),
      this.normalizeGoals(matchData.awayTeam?.goalsFor),
      context?.homeAdvantage || 1,
      context?.weather || 0.5,
      context?.importance || 0.5,
      context?.restDays || 7,
    ];
  }

  private forwardPass(features: number[]): number[] {
    const hidden1 = this.layer(features, 8);
    const hidden2 = this.layer(hidden1, 4);
    const output = this.softmax(this.layer(hidden2, 3));
    return output;
  }

  private layer(input: number[], size: number): number[] {
    const output = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      let sum = 0;
      for (let j = 0; j < input.length; j++) {
        sum += input[j] * this.randomWeight();
      }
      output[i] = this.relu(sum);
    }
    return output;
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }

  private softmax(x: number[]): number[] {
    const expValues = x.map(val => Math.exp(val));
    const sum = expValues.reduce((a, b) => a + b, 0);
    return expValues.map(val => val / sum);
  }

  private randomWeight(): number {
    return Math.random() * 0.5 + 0.25;
  }

  private normalizeForm(form: string = 'DDD'): number {
    let score = 0;
    for (const char of form) {
      if (char === 'W') score += 3;
      else if (char === 'D') score += 1;
    }
    return score / (form.length * 3);
  }

  private normalizeGoals(goals: number = 0): number {
    return Math.min(goals / 50, 1);
  }

  private interpretOutput(output: number[]): string {
    const maxIndex = output.indexOf(Math.max(...output));
    return ['HOME', 'DRAW', 'AWAY'][maxIndex];
  }
}
