export class ValueBetHunter {
  findValue(prediction: number, bookmakerOdds: number): number {
    const fairOdds = 1 / prediction;
    const edge = (fairOdds / bookmakerOdds) - 1;
    return edge > 0.05 ? edge : 0;
  }
}
