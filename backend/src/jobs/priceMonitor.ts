import cron from 'node-cron';
import { ConstraintEvaluatorService } from '../services/ConstraintEvaluatorService';
import { PortfolioService } from '../services/PortfolioService';
import { MarketDataService } from '../services/MarketDataService';

export class PriceMonitorJob {
  private static constraintEvaluationJob: cron.ScheduledTask | null = null;
  private static priceUpdateJob: cron.ScheduledTask | null = null;

  static start(): void {
    console.log('🚀 Starting price monitoring jobs...');

    // Constraint evaluation job - runs every minute during market hours
    this.constraintEvaluationJob = cron.schedule('* * * * *', async () => {
      try {
        const marketStatus = await MarketDataService.getMarketStatus();
        
        if (!marketStatus.isOpen) {
          console.log('Market is closed, skipping constraint evaluation');
          return;
        }

        console.log('⏰ Running constraint evaluation...');
        const triggers = await ConstraintEvaluatorService.evaluateAllConstraints();
        
        if (triggers.length > 0) {
          console.log(`✅ Processed ${triggers.length} constraint triggers`);
        }
      } catch (error) {
        console.error('❌ Error in constraint evaluation job:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Portfolio price update job - runs every 5 minutes during market hours
    this.priceUpdateJob = cron.schedule('*/5 * * * *', async () => {
      try {
        const marketStatus = await MarketDataService.getMarketStatus();
        
        if (!marketStatus.isOpen) {
          console.log('Market is closed, skipping price updates');
          return;
        }

        console.log('📊 Updating portfolio prices...');
        await PortfolioService.updateAllPositionPrices();
        console.log('✅ Portfolio prices updated');
      } catch (error) {
        console.error('❌ Error in price update job:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Start the jobs
    this.constraintEvaluationJob.start();
    this.priceUpdateJob.start();

    console.log('✅ Price monitoring jobs started');
    console.log('   - Constraint evaluation: Every minute during market hours');
    console.log('   - Portfolio price updates: Every 5 minutes during market hours');
  }

  static stop(): void {
    console.log('🛑 Stopping price monitoring jobs...');

    if (this.constraintEvaluationJob) {
      this.constraintEvaluationJob.stop();
      this.constraintEvaluationJob = null;
    }

    if (this.priceUpdateJob) {
      this.priceUpdateJob.stop();
      this.priceUpdateJob = null;
    }

    console.log('✅ Price monitoring jobs stopped');
  }

  static getStatus(): {
    constraintEvaluationRunning: boolean;
    priceUpdateRunning: boolean;
  } {
    return {
      constraintEvaluationRunning: this.constraintEvaluationJob !== null,
      priceUpdateRunning: this.priceUpdateJob !== null
    };
  }

  // Manual trigger methods for testing
  static async triggerConstraintEvaluation(): Promise<void> {
    console.log('🔧 Manually triggering constraint evaluation...');
    try {
      const triggers = await ConstraintEvaluatorService.evaluateAllConstraints();
      console.log(`✅ Manual constraint evaluation completed. Found ${triggers.length} triggers.`);
    } catch (error) {
      console.error('❌ Error in manual constraint evaluation:', error);
      throw error;
    }
  }

  static async triggerPriceUpdate(): Promise<void> {
    console.log('🔧 Manually triggering price update...');
    try {
      await PortfolioService.updateAllPositionPrices();
      console.log('✅ Manual price update completed');
    } catch (error) {
      console.error('❌ Error in manual price update:', error);
      throw error;
    }
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping price monitoring jobs...');
  PriceMonitorJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping price monitoring jobs...');
  PriceMonitorJob.stop();
  process.exit(0);
});