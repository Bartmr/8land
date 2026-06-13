declare global {
  interface Window {
    _hotReloadClasses: Map<string, any>
  }
}

export function HotReloadClass(module: NodeJS.Module) {
  return <T extends { new (...args: any[]): {} }>(targetClass: T): T => {
    
    if (!module.hot) {
      return targetClass;
    }

    
    window._hotReloadClasses = window._hotReloadClasses || new Map<string, any>();

    const classKey = `${module.id}:${targetClass.name}`

    const existingClass = window._hotReloadClasses.get(classKey);

    if (!existingClass) {
      window._hotReloadClasses.set(classKey, targetClass);
      return targetClass;
    }
  
    // Copy every method/getter/setter from the new prototype onto the
    // old prototype. Existing instances keep their own state (instance
    // properties) but immediately inherit the updated methods.
    const oldProto = existingClass.prototype;

    for (const prop of Object.getOwnPropertyNames(targetClass.prototype)) {
      if (prop === 'constructor') {
        continue;
      }

      Object.defineProperty(
        oldProto,
        prop,
        Object.getOwnPropertyDescriptor(targetClass.prototype, prop)!,
      );
    }

    // Copy static properties
    for (const prop of Object.getOwnPropertyNames(targetClass)) {
      if (prop === 'prototype' || prop === 'length' || prop === 'name') {
        continue;
      }
      
      Object.defineProperty(
        existingClass,
        prop,
        Object.getOwnPropertyDescriptor(targetClass, prop)!,
      );
    }


    // Return the original constructor so references stay
    // valid across reloads.
    return existingClass as any;
  };
}