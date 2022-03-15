export class UserAvatarService {
  static generateAvatarFromName(customerName: string = ''): string {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to create canvas');
    }

    context.moveTo(20, 20);
    context.lineTo(100, 20);

    context.fillStyle = '#abb2ba';
    context.fillRect(0, 0, 320, 320);
    context.fill();

    context.font = '145px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    const shortName = String(customerName || '')
      .split(' ')
      .reduce((acc, current) => acc + (current || '').substring(0, 1).toUpperCase(), '');
    context.fillText(shortName.substring(0, 2), 160, 212);
    return canvas.toDataURL('image/png', .95);
  }
}
