// EQuery Interface definition, representing methods that can be chained for DOM manipulation
interface EQuery {
    elements: HTMLElement[]; // The elements that the EQuery instance is managing
    
    //Recover methods for DOM manipulation and traversal
    getAttr(name: string): string; // Get the value of an attribute from the first selected element
    find(selector: string): EQuery; // Get child elements matching the given selector
    children(): EQuery; // Get child elements of the selected elements
    parent(): EQuery; // Get the parent of each selected element
    parents(selector?: string): EQuery; // Get ancestors of each selected element, optionally filtered by selector
    siblings(selector?: string): EQuery; // Get siblings of each selected element, optionally filtered by selector
    next(selector?: string): EQuery; // Get the next sibling of each selected element, optionally filtered by selector
    prev(selector?: string): EQuery; // Get the previous sibling of each selected element, optionally filtered by selector
    closest(selector: string): EQuery; // Get the nearest ancest of each selected element, optionally filtered by selector
    first(selector?: string): EQuery // Get the first element of each selected element
    last(selector?: string): EQuery; // Get the last element of each selected element
    
    // Dom Manipulation methods
    css(property: string, value: string): EQuery; // Set CSS properties for selected elements
    addClass(className: string): EQuery; // Add a class to selected elements
    removeClass(className: string): EQuery; // Remove a class from selected elements
    setAttr(name: string, value: string): EQuery; // Set an attribute for selected elements
    html(htmlString?: string): string | EQuery; // Get or set the inner HTML of selected elements
    
    // Filter methods
    has(selector: string): EQuery; // Check if any of the selected elements match the given selector
    filter(callback: (el: HTMLElement, index: number) => boolean): EQuery; // Filter selected elements based on a callback function
    eq(index: number): EQuery; // Get the element at the specified index from the selected elements
    not(selector: string | ((el: HTMLElement) => boolean)): EQuery; // Filter out elements that match the given selector or condition
    
    
    // Events Bindings methods
    on( // Attach event listeners to elements, with optional selector
        events: string,
        selectorOrHandler: string | EventListener,
        handlerOrOptions?: EventListener | boolean | AddEventListenerOptions,
        options?: boolean | AddEventListenerOptions
    ): EQuery;
    
    // Utility methods
    forEach(callback: (el: HTMLElement, index: number) => void): void; // Iterate over selected elements
    each(callback: (el: HTMLElement, index: number) => void): EQuery; // Iterate over selected elements with chaining support
}

// Safe querySelectorAll function with error handling
function safeQuerySelectorAll(selector: string): HTMLElement[] {
    try {
        return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    } catch (e) {
        const error = e as Error;
        throw new Error(`EQuery Error: Failed to parse selector "${selector}".\nReason: ${error.message}`);
    }
}

// The main $ function, which mimics jQuery's basic DOM manipulation behavior
function $(selector: string | HTMLElement | HTMLElement[]): EQuery {
    let elements: HTMLElement[];
    
    // If selector is a string, use querySelectorAll to find elements
    if (typeof selector === 'string') {
        elements = safeQuerySelectorAll(selector);
    } else if (selector instanceof HTMLElement) {
        // If it's a single HTMLElement, wrap it in an array
        elements = [selector];
    } else if (Array.isArray(selector)) {
        // If it's an array of HTMLElements, use it directly
        elements = selector;
    } else {
        throw new Error(`EQuery Error: Invalid selector type. Expected string, HTMLElement, or HTMLElement[].`);
    }
    
    // Create the EQuery instance with the methods for DOM manipulation
    const instance = {
        elements,
        
        // forEach method to iterate over elements and execute the callback
        forEach(callback: (el: HTMLElement, index: number) => void): void {
            this.elements.forEach(callback);
        },
        
        // each method that allows chaining, iterates over elements
        each(this: EQuery, callback: (el: HTMLElement, index: number) => void): EQuery {
            this.elements.forEach((el, index) => callback(el, index));
            return this;
        },
        
        // css method to set CSS styles, either a single property or multiple properties
        css(this: EQuery, propertyOrProperties: string | { [key: string]: string }, value?: string): EQuery {
            if (typeof propertyOrProperties === 'string') {
                // If a single CSS property is provided
                this.elements.forEach((el: HTMLElement) => {
                    (el.style as any)[propertyOrProperties] = value;
                });
            } else {
                // If multiple CSS properties are provided
                for (const prop in propertyOrProperties) {
                    const val = propertyOrProperties[prop];
                    this.elements.forEach((el: HTMLElement) => {
                        (el.style as any)[prop] = val;
                    });
                }
            }
            return this;
        },
        
        // addClass method to add a class to selected elements
        addClass(this: EQuery, className: string): EQuery {
            this.elements.forEach((el: HTMLElement) => el.classList.add(className));
            return this;
        },
        
        // removeClass method to remove a class from selected elements
        removeClass(this: EQuery, className: string): EQuery {
            this.elements.forEach((el: HTMLElement) => el.classList.remove(className));
            return this;
        },
        
        // setAttr method to set an attribute on selected elements
        setAttr(this: EQuery, name: string, value: string): EQuery {
            this.elements.forEach((el: HTMLElement) => el.setAttribute(name, value));
            return this;
        },
        
        // getAttr method to retrieve the value of an attribute from the first element
        getAttr(this: EQuery, name: string): string {
            return this.elements[0]?.getAttribute(name) || '';
        },
        
        // html method to get or set the innerHTML of selected elements
        html(this: EQuery, htmlString?: string): string | EQuery {
            if (htmlString === undefined) {
                return this.elements[0]?.innerHTML || '';
            }
            this.elements.forEach((el: HTMLElement) => el.innerHTML = htmlString);
            return this;
        },
        
        // on method to attach event listeners to elements, with event delegation support
        on(
            this: EQuery,
            events: string,
            selectorOrHandler: string | EventListener,
            handlerOrOptions?: EventListener | boolean | AddEventListenerOptions,
            options?: boolean | AddEventListenerOptions
        ): EQuery {
            const eventList = events.split(/\s+/);
            
            if (typeof selectorOrHandler === 'function') {
                this.forEach((el: HTMLElement) => {
                    eventList.forEach(event => {
                        // Attach event listener directly
                        el.addEventListener(event, function (e: Event) {
                            const clickedElement = e.target as HTMLElement;
                            (selectorOrHandler as EventListener).call(clickedElement, e);
                        }.bind(this), handlerOrOptions as boolean | AddEventListenerOptions);
                    });
                });
            } else if (typeof selectorOrHandler === 'string' && typeof handlerOrOptions === 'function') {
                // Delegate events to elements matching the selector
                this.forEach((el: HTMLElement) => {
                    eventList.forEach(event => {
                        el.addEventListener(event, function (e: Event) {
                            const target = e.target as HTMLElement;
                            if (target && target.matches(selectorOrHandler)) {
                                (handlerOrOptions as EventListener).call(target, e);
                            }
                        }.bind(this), options);
                    });
                });
            }
            
            return this;
        },
        
        // find method to search for child elements that match a given selector
        find(this: EQuery, selector: string): EQuery {
            const foundElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                foundElements.push(...Array.from(el.querySelectorAll(selector)) as HTMLElement[]);
            });
            return $(foundElements);
        },
        
        // children method to get child elements of selected elements
        children(this: EQuery): EQuery {
            const childElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                Array.from(el.children).forEach((child: Element) => {
                    childElements.push(child as HTMLElement);
                });
            });
            return $(childElements);
        },
        
        // parent method to get the parent of each selected element
        parent(this: EQuery): EQuery {
            const parentElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                const parent = el.parentElement;
                if (parent && parent instanceof HTMLElement) {
                    parentElements.push(parent);
                }
            });
            return $(parentElements);
        },
        
        // parents method to get ancestors of each selected element
        parents(this: EQuery, selector?: string): EQuery {
            const parentElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                let parent = el.parentElement;
                while (parent) {
                    if (parent instanceof HTMLElement) {
                        // If a selector is provided, check if the parent matches it
                        if (selector && parent.matches(selector)) {
                            parentElements.push(parent);
                            break;
                        } else if (!selector) {
                            // Add all parents if no selector
                            parentElements.push(parent); 
                        }
                    }
                    parent = parent.parentElement;
                }
            });
            return $(parentElements);
        },
        
        // siblings method to get siblings of each selected element
        siblings(this: EQuery, selector?: string): EQuery {
            const siblingElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                const parent = el.parentElement;
                if (parent) {
                    Array.from(parent.children).forEach((sibling) => {
                        if (sibling !== el && sibling instanceof HTMLElement) {
                            if (selector && sibling.matches(selector)) {
                                siblingElements.push(sibling);
                            } else if (!selector) {
                                siblingElements.push(sibling);
                            }
                        }
                    });
                }
            });
            return $(siblingElements);
        },
        
        // next method to get the next sibling of each selected element
        next(this: EQuery, selector?: string): EQuery {
            const nextElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                let nextSibling = el.nextElementSibling;
                while (nextSibling) {
                    if (nextSibling instanceof HTMLElement) {
                        if (selector && nextSibling.matches(selector)) {
                            nextElements.push(nextSibling);
                            break;
                        } else if (!selector) {
                            nextElements.push(nextSibling);
                            break;
                        }
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
            });
            return $(nextElements);
        },
        
        // prev method to get the previous sibling of each selected element
        prev(this: EQuery, selector?: string): EQuery {
            const prevElements: HTMLElement[] = [];
            this.elements.forEach((el: HTMLElement) => {
                let prevSibling = el.previousElementSibling;
                while (prevSibling) {
                    if (prevSibling instanceof HTMLElement) {
                        if (selector && prevSibling.matches(selector)) {
                            prevElements.push(prevSibling);
                            break;
                        } else if (!selector) {
                            prevElements.push(prevSibling);
                            break;
                        }
                    }
                    prevSibling = prevSibling.previousElementSibling;
                }
            });
            return $(prevElements);
        },
        
        // closest method to get the nearest ancestor of each selected element
        closest(this: EQuery, selector: string): EQuery {
            const closestElements: HTMLElement[] = [];
            
            this.elements.forEach((el: HTMLElement) => {
                let parent: HTMLElement | null = el;  // Start from the element itself
                
                // Traverse up the ancestors
                while (parent) {
                    if (parent.matches(selector)) {
                        closestElements.push(parent);
                        break;  // Stop at the first matching ancestor
                    }
                    parent = parent.parentElement;  // Move to the parent element
                }
            });
            
            return $(closestElements);  // Return EQuery instance with matched ancestors
        },
        
        // first method to get the first element of each selected element
        first(selector?: string): EQuery {
            const firstElements = this.elements.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children) as HTMLElement[];
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;
                
                // Return the first filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[0] : null;
            }).filter(Boolean);
            
            return $(firstElements as HTMLElement[]);
        },
        
        // last method to get the last element of each selected element
        last(selector?: string): EQuery {
            const lastElements = this.elements.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children) as HTMLElement[];
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;
                
                // Return the last filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[filteredChildren.length - 1] : null;
            }).filter(Boolean);
            
            return $(lastElements as HTMLElement[]);
        },
        
        // has method to check whether a specific element is a descendant of any of the selected elements
        has(selector: string): EQuery {
            const filteredElements = this.elements.filter((el: HTMLElement) => {
                // Check if the element contains the selector
                return el.querySelector(selector) !== null; 
            });
            
            return $(filteredElements);
        },
        
        // Filter method to  filter out elements from a collection based on a provided condition or function
        filter(callback: (el: HTMLElement, index: number) => boolean): EQuery {
            const filteredElements = this.elements.filter((el, index) => {
                // Apply the callback function to each element
                return callback(el, index);
            });
            
            return $(filteredElements);
        },
        
        // Filter method to get an element at a specific index in the current collection of elements
        eq(index: number): EQuery {
            // Ensure index is within the bounds of the elements array
            const element = this.elements[index >= 0 ? index : this.elements.length + index];
            // Return a new EQuery instance with a single element at the specified index
            return $(element ? [element] : []);
        },
        
        // Filter method to exclude certain elements from the set of selected elements
        not(selector: string | ((el: HTMLElement) => boolean)): EQuery {
            let filteredElements: HTMLElement[];
            
            if (typeof selector === 'string') {
                // Filter out elements that match the given selector
                filteredElements = this.elements.filter(el => !el.matches(selector));
            } else if (typeof selector === 'function') {
                // Filter out elements that return true from the callback function
                filteredElements = this.elements.filter(el => !selector(el));
            } else {
                filteredElements = [];
            }
            
            return $(filteredElements);
        },
        
    };
    
    return instance as EQuery;
}
