/**
 * Voice Command Service
 * Handles speech recognition and voice commands beyond tips
 */

import Voice from '@react-native-voice/voice';
import { speakText } from '../utils/voice';

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: any;
  confidence: number;
}

export interface VoiceCommandHandler {
  pattern: RegExp;
  action: (params: any) => Promise<void>;
  description: string;
}

class VoiceCommandService {
  private static instance: VoiceCommandService;
  private isListening: boolean = false;
  private commandHandlers: Map<string, VoiceCommandHandler> = new Map();
  private onCommandCallback?: (command: VoiceCommand) => void;

  private constructor() {
    this.initializeVoice();
    this.registerDefaultCommands();
  }

  public static getInstance(): VoiceCommandService {
    if (!VoiceCommandService.instance) {
      VoiceCommandService.instance = new VoiceCommandService();
    }
    return VoiceCommandService.instance;
  }

  /**
   * Initialize voice recognition
   */
  private async initializeVoice(): Promise<void> {
    try {
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);

      console.log('Voice command service initialized');
    } catch (error) {
      console.error('Failed to initialize voice:', error);
    }
  }

  /**
   * Start listening for voice commands
   */
  public async startListening(): Promise<void> {
    try {
      if (this.isListening) {
        await this.stopListening();
      }

      await speakText('Listening for commands');
      setTimeout(async () => {
        try {
          await Voice.start('en-US');
          this.isListening = true;
        } catch (e) {
          console.error('Failed to start Voice:', e);
          this.isListening = false;
        }
      }, 500);
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.isListening = false;
    }
  }

  /**
   * Stop listening for voice commands
   */
  public async stopListening(): Promise<void> {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }

  /**
   * Cancel voice recognition
   */
  public async cancel(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to cancel voice:', error);
    }
  }

  /**
   * Register default voice commands
   */
  private registerDefaultCommands(): void {
    // Show dashboard
    this.registerCommand('show-dashboard', {
      pattern: /show (dashboard|home|main screen)/i,
      action: async () => {
        await speakText('Showing dashboard');
      },
      description: 'Navigate to dashboard',
    });

    // Add appliance
    this.registerCommand('add-appliance', {
      pattern: /add (a )?(\w+)( with )?(\d+)?( watts)?/i,
      action: async (params) => {
        const applianceName = params[2];
        const wattage = params[4] || 100;
        await speakText(`Adding ${applianceName} with ${wattage} watts`);
      },
      description: 'Add new appliance',
    });

    // Show energy usage
    this.registerCommand('show-usage', {
      pattern: /show (energy )?usage|what('s| is) (my )?usage/i,
      action: async () => {
        await speakText('Showing energy usage');
      },
      description: 'Show current energy usage',
    });

    // Set goal
    this.registerCommand('set-goal', {
      pattern: /set( a)? goal( of)?( to save)?( energy)? (\d+)/i,
      action: async (params) => {
        const amount = params[5];
        await speakText(`Setting energy savings goal of ${amount} kilowatt hours`);
      },
      description: 'Set energy savings goal',
    });

    // Show tips
    this.registerCommand('show-tips', {
      pattern: /show (energy )?tips|give me (some )?tips/i,
      action: async () => {
        await speakText('Showing energy saving tips');
      },
      description: 'Show energy tips',
    });

    // Turn on/off appliance
    this.registerCommand('toggle-appliance', {
      pattern: /turn (on|off) (the )?(\w+)/i,
      action: async (params) => {
        const action = params[1];
        const appliance = params[3];
        await speakText(`Turning ${action} ${appliance}`);
      },
      description: 'Control appliance',
    });

    // Check savings
    this.registerCommand('check-savings', {
      pattern: /how much (have I |did I )?save(d)?|what('s| is) my savings/i,
      action: async () => {
        await speakText('Checking your energy savings');
      },
      description: 'Check total savings',
    });

    // Show community goals
    this.registerCommand('show-community', {
      pattern: /show community|community goals/i,
      action: async () => {
        await speakText('Showing community goals');
      },
      description: 'Show community goals',
    });

    // Show challenges
    this.registerCommand('show-challenges', {
      pattern: /show challenges|my challenges/i,
      action: async () => {
        await speakText('Showing your challenges');
      },
      description: 'Show active challenges',
    });

    // Show energy map
    this.registerCommand('show-map', {
      pattern: /show (energy )?map|energy hotspots/i,
      action: async () => {
        await speakText('Showing energy map');
      },
      description: 'Show energy map',
    });

    // Create challenge
    this.registerCommand('create-challenge', {
      pattern: /create( a)? challenge( to)?( save)?( energy)? (\d+)/i,
      action: async (params) => {
        const amount = params[5];
        await speakText(`Creating challenge to save ${amount} kilowatt hours`);
      },
      description: 'Create new challenge',
    });

    // Show progress
    this.registerCommand('show-progress', {
      pattern: /show (my )?progress|how am I doing/i,
      action: async () => {
        await speakText('Showing your progress');
      },
      description: 'Show progress',
    });

    // Get weather tips
    this.registerCommand('weather-tips', {
      pattern: /weather tips|energy tips for (today|weather)/i,
      action: async () => {
        await speakText('Getting weather-based energy tips');
      },
      description: 'Get weather tips',
    });

    // Show leaderboard
    this.registerCommand('show-leaderboard', {
      pattern: /show leaderboard|my rank(ing)?/i,
      action: async () => {
        await speakText('Showing leaderboard');
      },
      description: 'Show leaderboard',
    });

    // Start AR mode
    this.registerCommand('start-ar', {
      pattern: /start (A R|augmented reality)|show (A R|augmented reality) map/i,
      action: async () => {
        await speakText('Starting augmented reality mode');
      },
      description: 'Start AR energy map',
    });

    // Check carbon footprint
    this.registerCommand('carbon-footprint', {
      pattern: /what('s| is) my carbon footprint|show carbon/i,
      action: async () => {
        await speakText('Showing your carbon footprint');
      },
      description: 'Show carbon footprint',
    });

    // Help command
    this.registerCommand('help', {
      pattern: /help|what can (I say|you do)/i,
      action: async () => {
        await speakText('You can say things like: show dashboard, add appliance, show usage, set goal, show tips, or ask for help');
      },
      description: 'Show available commands',
    });
  }

  /**
   * Register custom command handler
   */
  public registerCommand(id: string, handler: VoiceCommandHandler): void {
    this.commandHandlers.set(id, handler);
  }

  /**
   * Unregister command handler
   */
  public unregisterCommand(id: string): void {
    this.commandHandlers.delete(id);
  }

  /**
   * Process voice command
   */
  private async processCommand(text: string): Promise<void> {
    console.log('Processing command:', text);

    let commandMatched = false;

    for (const [id, handler] of this.commandHandlers) {
      const match = text.match(handler.pattern);
      if (match) {
        console.log('Matched command:', id);
        commandMatched = true;

        const command: VoiceCommand = {
          command: text,
          action: id,
          parameters: match,
          confidence: 1.0,
        };

        if (this.onCommandCallback) {
          this.onCommandCallback(command);
        }

        await handler.action(match);
        break;
      }
    }

    if (!commandMatched) {
      await speakText("Sorry, I didn't understand that command. Try saying help for available commands.");
    }
  }

  /**
   * Set callback for command recognition
   */
  public onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback;
  }

  /**
   * Speech start handler
   */
  private onSpeechStart(): void {
    console.log('Speech started');
  }

  /**
   * Speech end handler
   */
  private onSpeechEnd(): void {
    console.log('Speech ended');
    this.isListening = false;
  }

  /**
   * Speech results handler
   */
  private onSpeechResults(event: any): void {
    const results = event.value;
    if (results && results.length > 0) {
      const text = results[0];
      console.log('Speech recognized:', text);
      this.processCommand(text);
    }
  }

  /**
   * Speech error handler
   */
  private onSpeechError(event: any): void {
    console.error('Speech error:', event.error);
    this.isListening = false;
  }

  /**
   * Check if currently listening
   */
  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get available commands
   */
  public getAvailableCommands(): Array<{ id: string; description: string }> {
    return Array.from(this.commandHandlers.entries()).map(([id, handler]) => ({
      id,
      description: handler.description,
    }));
  }

  /**
   * Destroy voice recognition
   */
  public async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      Voice.removeAllListeners();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to destroy voice:', error);
    }
  }
}

export default VoiceCommandService.getInstance();
