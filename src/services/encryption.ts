import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  getEncryptionKey(): string | null {
    return this.encryptionKey;
  }

  generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  encrypt(data: any): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
  }

  decrypt(encryptedData: string): any {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  encryptTask(task: any): any {
    const sensitiveFields = ['title', 'description', 'notes', 'attachments'];
    const encryptedTask = { ...task };
    
    sensitiveFields.forEach(field => {
      if (task[field]) {
        encryptedTask[field] = this.encrypt(task[field]);
      }
    });
    
    return encryptedTask;
  }

  decryptTask(encryptedTask: any): any {
    const sensitiveFields = ['title', 'description', 'notes', 'attachments'];
    const decryptedTask = { ...encryptedTask };
    
    sensitiveFields.forEach(field => {
      if (encryptedTask[field]) {
        try {
          decryptedTask[field] = this.decrypt(encryptedTask[field]);
        } catch (error) {
          console.error(`Failed to decrypt field: ${field}`, error);
          decryptedTask[field] = '[Encrypted]';
        }
      }
    });
    
    return decryptedTask;
  }

  encryptGoal(goal: any): any {
    const sensitiveFields = ['title', 'description', 'notes'];
    const encryptedGoal = { ...goal };
    
    sensitiveFields.forEach(field => {
      if (goal[field]) {
        encryptedGoal[field] = this.encrypt(goal[field]);
      }
    });
    
    return encryptedGoal;
  }

  decryptGoal(encryptedGoal: any): any {
    const sensitiveFields = ['title', 'description', 'notes'];
    const decryptedGoal = { ...encryptedGoal };
    
    sensitiveFields.forEach(field => {
      if (encryptedGoal[field]) {
        try {
          decryptedGoal[field] = this.decrypt(encryptedGoal[field]);
        } catch (error) {
          console.error(`Failed to decrypt field: ${field}`, error);
          decryptedGoal[field] = '[Encrypted]';
        }
      }
    });
    
    return decryptedGoal;
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  verifyPassword(password: string, hash: string): boolean {
    return CryptoJS.SHA256(password).toString() === hash;
  }
}

export default EncryptionService.getInstance(); 