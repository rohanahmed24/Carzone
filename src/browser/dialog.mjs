/** Native modal focus containment, with explicit restoration on every close path. */
export function mountDialog(dialog,opener) {
  const close=()=>{if(dialog.open) dialog.close();};
  dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',close));
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('close',()=>{if(opener?.isConnected) opener.focus();});
  return {open(){dialog.showModal();},close};
}
