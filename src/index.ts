// TSQuery Interface definition, representing methods that can be chained for DOM manipulation
interface TSQuery {
    $el: HTMLElement[]; // The elements that the TSQuery instance is managing

    //Recover methods for DOM manipulation and traversal
    find(selector: string): TSQuery; // Get child elements matching the given selector
    children(): TSQuery; // Get child elements of the selected elements
    parent(): TSQuery; // Get the parent of each selected element
    parents(selector?: string): TSQuery; // Get ancestors of each selected element, optionally filtered by selector
    siblings(selector?: string): TSQuery; // Get siblings of each selected element, optionally filtered by selector
    next(selector?: string): TSQuery; // Get the next sibling of each selected element, optionally filtered by selector
    prev(selector?: string): TSQuery; // Get the previous sibling of each selected element, optionally filtered by selector
    closest(selector: string): TSQuery; // Get the nearest ancest of each selected element, optionally filtered by selector
    first(selector?: string): TSQuery // Get the first element of each selected element
    last(selector?: string): TSQuery; // Get the last element of each selected element

    // Dom Manipulation methods
    css(property: string, value: string): TSQuery; // Set CSS properties for selected elements
    getAttr(name: string): string; // Get the value of an attribute from the first selected element
    setAttr(name: string, value: string): TSQuery; // Set an attribute for selected elements
    addClass(className: string): TSQuery; // Add a class to selected elements
    removeClass(className: string): TSQuery; // Remove a class from selected elements
    html(htmlString?: string): string | TSQuery; // Get or set the inner HTML of selected elements
    toggleClass(selector?: string | ((el: HTMLElement) => boolean)): TSQuery; // Toggle the class of each selected element
    text(selector?: string): string | TSQuery; // Get or set the text content of selected elements
    val(this: TSQuery, value?: string): string | TSQuery  // Get or set the value of selected elements
    animate(this: TSQuery, properties: Partial<CSSStyleDeclaration>, duration?: number, easing?: (t: number) => number, callback?: () => void): string | TSQuery;

    // Filter methods
    has(selector: string): TSQuery; // Check if any of the selected elements match the given selector
    filter(callback: (el: HTMLElement, index: number) => boolean): TSQuery; // Filter selected elements based on a callback function
    eq(index: number): TSQuery; // Get the element at the specified index from the selected elements
    not(selector?: string | ((el: HTMLElement) => boolean)): TSQuery; // Filter out elements that match the given selector or condition


    // Events Bindings methods
    on( // Attach event listeners to elements, with optional selector
        events: string,
        selectorOrHandler: string | EventListener,
        handlerOrOptions?: EventListener | boolean | AddEventListenerOptions,
        options?: boolean | AddEventListenerOptions
    ): TSQuery;

    // Utility methods
    forEach(callback: (el: HTMLElement, index: number) => void): void; // Iterate over selected elements
    each(callback: (el: HTMLElement, index: number) => void): TSQuery; // Iterate over selected elements with chaining support
}
function safTSQuerySelectorAll(selector: string): HTMLElement[] {
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
}

export function $(selector: string | HTMLElement | HTMLElement[]): TSQuery {
    let $el: HTMLElement[];

    // If selector is a string, use querySelectorAll to find elements
    if (typeof selector === 'string') {
        $el = safTSQuerySelectorAll(selector);
    } else if (selector instanceof HTMLElement) {
        // If it's a single HTMLElement, wrap it in an array
        $el = [selector];
    } else if (Array.isArray(selector)) {
        // If it's an array of HTMLElements, use it directly
        $el = selector;
    } else {
        throw new Error(`TSQuery Error: Invalid selector type. Expected string, HTMLElement, or HTMLElement[].`);
    }

    // Create the TSQuery instance with the methods for DOM manipulation
    const instance = {
        $el,

        // forEach method to iterate over elements and execute the callback
        forEach(callback: (el: HTMLElement, index: number) => void): void {
            this.$el.forEach(callback);
        },

        // each method that allows chaining, iterates over elements
        each(this: TSQuery, callback: (el: HTMLElement, index: number) => void): TSQuery {
            this.$el.forEach((el, index) => callback(el, index));
            return this;
        },

        // css method to set CSS styles, either a single property or multiple properties
        css(this: TSQuery, propertyOrProperties: string | { [key: string]: string }, value?: string): TSQuery {
            if (typeof propertyOrProperties === 'string') {
                // If a single CSS property is provided
                this.$el.forEach((el: HTMLElement) => {
                    (el.style as any)[propertyOrProperties] = value;
                });
            } else {
                // If multiple CSS properties are provided
                for (const prop in propertyOrProperties) {
                    const val = propertyOrProperties[prop];
                    this.$el.forEach((el: HTMLElement) => {
                        (el.style as any)[prop] = val;
                    });
                }
            }
            return this;
        },

        // addClass method to add a class to selected elements
        addClass(this: TSQuery, className: string): TSQuery {
            this.$el.forEach((el: HTMLElement) => el.classList.add(className));
            return this;
        },

        // removeClass method to remove a class from selected elements
        removeClass(this: TSQuery, className: string): TSQuery {
            this.$el.forEach((el: HTMLElement) => el.classList.remove(className));
            return this;
        },

        // setAttr method to set an attribute on selected elements
        setAttr(this: TSQuery, name: string, value: string): TSQuery {
            this.$el.forEach((el: HTMLElement) => el.setAttribute(name, value));
            return this;
        },

        // getAttr method to retrieve the value of an attribute from the first element
        getAttr(this: TSQuery, name: string): string {
            return this.$el[0]?.getAttribute(name) || '';
        },

        // html method to get or set the innerHTML of selected elements
        html(this: TSQuery, htmlString?: string): string | TSQuery {
            if (htmlString === undefined) {
                return this.$el[0]?.innerHTML || '';
            }
            this.$el.forEach((el: HTMLElement) => el.innerHTML = htmlString);
            return this;
        },

        // on method to attach event listeners to elements, with event delegation support
        on(
            this: TSQuery,
            events: string,
            selectorOrHandler: string | EventListener,
            handlerOrOptions?: EventListener | boolean | AddEventListenerOptions,
            options?: boolean | AddEventListenerOptions
        ): TSQuery {
            const eventList = events.split(/\s+/);

            if (typeof selectorOrHandler === 'function') {
                this.forEach((el: HTMLElement) => {
                    eventList.forEach(event => {
                        el.addEventListener(event, function (e: Event) {
                            const clickedElement = e.target as HTMLElement;
                            (selectorOrHandler as EventListener).call(clickedElement, e);
                        }.bind(this), handlerOrOptions as boolean | AddEventListenerOptions);
                    });
                });
            } else if (typeof selectorOrHandler === 'string' && typeof handlerOrOptions === 'function') {
                this.forEach((el: HTMLElement) => {
                    eventList.forEach(event => {
                        el.addEventListener(event, function (e: Event) {
                            const target = e.target as HTMLElement;
                            const potentialMatch = target.closest(selectorOrHandler);

                            if (potentialMatch && el.contains(potentialMatch)) {
                                (handlerOrOptions as EventListener).call(potentialMatch, e);
                            }
                        }.bind(this), options);
                    });
                });
            }

            return this;
        },

        // find method to search for child elements that match a given selector
        find(this: TSQuery, selector: string): TSQuery {
            const foundElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
                foundElements.push(...Array.from(el.querySelectorAll(selector)) as HTMLElement[]);
            });
            return $(foundElements);
        },

        // children method to get child elements of selected elements
        children(this: TSQuery): TSQuery {
            const childElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
                Array.from(el.children).forEach((child: Element) => {
                    childElements.push(child as HTMLElement);
                });
            });
            return $(childElements);
        },

        // parent method to get the parent of each selected element
        parent(this: TSQuery): TSQuery {
            const parentElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
                const parent = el.parentElement;
                if (parent && parent instanceof HTMLElement) {
                    parentElements.push(parent);
                }
            });
            return $(parentElements);
        },

        // parents method to get ancestors of each selected element
        parents(this: TSQuery, selector?: string): TSQuery {
            const parentElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
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
        siblings(this: TSQuery, selector?: string): TSQuery {
            const siblingElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
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
        next(this: TSQuery, selector?: string): TSQuery {
            const nextElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
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
        prev(this: TSQuery, selector?: string): TSQuery {
            const prevElements: HTMLElement[] = [];
            this.$el.forEach((el: HTMLElement) => {
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
        closest(this: TSQuery, selector: string): TSQuery {
            const closestElements: HTMLElement[] = [];

            this.$el.forEach((el: HTMLElement) => {
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

            return $(closestElements);  // Return TSQuery instance with matched ancestors
        },

        // first method to get the first element of each selected element
        first(selector?: string): TSQuery {
            const firstElements = this.$el.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children) as HTMLElement[];
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;

                // Return the first filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[0] : null;
            }).filter(Boolean);

            return $(firstElements as HTMLElement[]);
        },

        // last method to get the last element of each selected element
        last(selector?: string): TSQuery {
            const lastElements = this.$el.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children) as HTMLElement[];
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;

                // Return the last filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[filteredChildren.length - 1] : null;
            }).filter(Boolean);

            return $(lastElements as HTMLElement[]);
        },

        // has method to check whether a specific element is a descendant of any of the selected elements
        has(selector: string): TSQuery {
            const filteredElements = this.$el.filter((el: HTMLElement) => {
                // Check if the element contains the selector
                return el.querySelector(selector) !== null;
            });

            return $(filteredElements);
        },

        // Filter method to  filter out elements from a collection based on a provided condition or function
        filter(callback: (el: HTMLElement, index: number) => boolean): TSQuery {
            const filteredElements = this.$el.filter((el, index) => {
                // Apply the callback function to each element
                return callback(el, index);
            });

            return $(filteredElements);
        },

        // Filter method to get an element at a specific index in the current collection of elements
        eq(index: number): TSQuery {
            // Ensure index is within the bounds of the elements array
            const element = this.$el[index >= 0 ? index : this.$el.length + index];
            // Return a new TSQuery instance with a single element at the specified index
            return $(element ? [element] : []);
        },

        // Filter method to exclude certain elements from the set of selected elements
        not(selector: string | ((el: HTMLElement) => boolean)): TSQuery {
            let filteredElements: HTMLElement[];

            if (typeof selector === 'string') {
                // Filter out elements that match the given selector
                filteredElements = this.$el.filter(el => !el.matches(selector));
            } else if (typeof selector === 'function') {
                // Filter out elements that return true from the callback function
                filteredElements = this.$el.filter(el => !selector(el));
            } else {
                filteredElements = [];
            }

            return $(filteredElements);
        },

        // Toggle method to toggle a class of selected elements
        toggleClass(selector: string): TSQuery {
            this.$el.forEach((el: HTMLElement) => {
                el.classList.toggle(selector);
            });
            return this;
        },

        // set or get the text content of selected elements
        text(selector?: string): string | TSQuery {
            if (selector === undefined || selector.trim() === '') {
                let combinedText: string = '';
                this.$el.forEach((el: HTMLElement) => {
                    combinedText += (el.textContent ?? '').trim();
                });
                return combinedText;
            } else {
                this.$el.forEach((el: HTMLElement) => {
                    el.textContent = selector;
                });
                return this;
            }
        },

        // set or get the value of form elements (input, textarea, select)
        val(this: TSQuery, value?: string): string | TSQuery {
            if (value === undefined) {
                const firstElement = this.$el[0] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined;
                if (firstElement && 'value' in firstElement) {
                    return firstElement.value;
                }
                return '';
            } else {
                this.$el.forEach((el) => {
                    if ('value' in el) {
                        (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = value;
                    }
                });
                return this;
            }
        },

        // Animate method to handle CSS transitions
        // This method allows for smooth transitions of CSS properties over a specified duration
        // It supports easing functions and a callback to be executed after the animation completes
        //No tranform properties are supported yet
        animate(
            this: TSQuery,
            properties: Partial<CSSStyleDeclaration>,
            duration: number = 400,
            easing: (t: number) => number = (t) => t,
            callback?: () => void
        ): string | TSQuery {
            const queueKey = '__TSQuery_animate_queue__';

            this.forEach((el: HTMLElement) => {
                if (!(queueKey in el)) (el as any)[queueKey] = [];
                const queue = (el as any)[queueKey] as Function[];

                queue.push(() => {
                    const startTime = performance.now();
                    const startStyles: Record<string, any> = {};
                    const endStyles: Record<string, any> = {};
                    const units: Record<string, string> = {};

                    for (const prop in properties) {
                        const computed = getComputedStyle(el)[prop as any];
                        const targetVal = (properties[prop as keyof CSSStyleDeclaration] || '').toString().trim();

                        const isNumeric = /^-?\d+(\.\d+)?([a-z%]*)?$/.test(targetVal);
                        const targetColor = parseColor(targetVal);
                        console.log('targetColor', targetColor)
                        const computedColor = parseColor(computed);
                        console.log('computedColor', computedColor)
                        if (targetColor && computedColor) {
                            startStyles[prop] = computedColor;
                            endStyles[prop] = targetColor;
                        } else if (isNumeric && /^-?\d+(\.\d+)?([a-z%]*)?$/.test(computed)) {
                            const start = parseFloat(computed);
                            const end = parseFloat(targetVal);
                            const unit = computed.match(/[a-z%]+$/i)?.[0] || '';
                            startStyles[prop] = start;
                            endStyles[prop] = end;
                            units[prop] = unit;
                        } else {
                            startStyles[prop] = null;
                            endStyles[prop] = targetVal;
                        }
                    }

                    const step = (now: number) => {
                        const t = Math.min(1, (now - startTime) / duration);
                        const eased = easing(t);

                        for (const prop in endStyles) {
                            const start = startStyles[prop];
                            const end = endStyles[prop];

                            if (Array.isArray(start)) {
                                const r = Math.round(start[0] + (end[0] - start[0]) * eased);
                                const g = Math.round(start[1] + (end[1] - start[1]) * eased);
                                const b = Math.round(start[2] + (end[2] - start[2]) * eased);
                                // no rounding for alpha / transparency
                                const a = start[3] + (end[3] - start[3]) * eased;
                                el.style[prop as any] = `rgb(${r}, ${g}, ${b}, ${a})`;
                            } else if (typeof start === 'number') {
                                const value = start + (end - start) * eased;
                                el.style[prop as any] = value + (units[prop] || '');
                            } else {
                                if (t === 1) el.style[prop as any] = end;
                            }
                        }

                        if (t < 1) {
                            requestAnimationFrame(step);
                        } else {
                            if (callback) callback();
                            queue.shift();
                            if (queue.length) queue[0]();
                        }
                    };

                    requestAnimationFrame(step);
                });

                if (queue.length === 1) queue[0]();
            });

            return this;
        }


    }





    // Utility function to parse color strings (e.g., rgb, hex) into RGBA values
    // This function is used in the animate method to handle color transitions
    function parseColor(color: string): [number, number, number, number] | null {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return null;
        // Setting fillStyle to the given color
        ctx.fillStyle = color;
        const computed = ctx.fillStyle;
        // Create a 1x1 pixel to extract the color
        ctx.fillRect(0, 0, 1, 1);
        const pixel = ctx.getImageData(0, 0, 1, 1).data;

        // If fully transparent, treat it as null
        if (pixel[3] === 0) return [0, 0, 0, 0];
        // Handle RGB format
        const rgbMatch = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            const a = parseInt('1');
            return [r, g, b, a];
        }

        // Handle RGBA format
        const rgbaMatch = computed.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
        if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            const a = parseInt(rgbaMatch[4]);
            return [r, g, b, a];
        }

        // Handle hex color formats (#RRGGBB or #RGB)
        const hexMatch = computed.match(/^#([a-fA-F0-9]{3}){1,2}$/);
        if (hexMatch) {
            // Strip the '#'
            let hex = hexMatch[0].substring(1);

            // Expand short hex (#RGB or #RGBA) to full form
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            } else if (hex.length === 4) {
                hex = hex.split('').map(c => c + c).join('');
            }

            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
            // alpha is normalized between 0 and 1
            return [r, g, b, a];
        }

        // Handle color names (e.g., 'red', 'blue', 'green', etc.)
        const colorNames: { [key: string]: [number, number, number, number] } = {
            aliceblue: [240, 248, 255, 1],
            antiquewhite: [250, 235, 215, 1],
            aqua: [0, 255, 255, 1],
            aquamarine: [127, 255, 212, 1],
            azure: [240, 255, 255, 1],
            beige: [245, 245, 220, 1],
            bisque: [255, 228, 196, 1],
            black: [0, 0, 0, 1],
            blanchedalmond: [255, 235, 205, 1],
            blue: [0, 0, 255, 1],
            blueviolet: [138, 43, 226, 1],
            brown: [165, 42, 42, 1],
            burlywood: [222, 184, 135, 1],
            cadetblue: [95, 158, 160, 1],
            chartreuse: [127, 255, 0, 1],
            chocolate: [210, 105, 30, 1],
            coral: [255, 127, 80, 1],
            cornflowerblue: [100, 149, 237, 1],
            cornsilk: [255, 248, 220, 1],
            crimson: [220, 20, 60, 1],
            cyan: [0, 255, 255, 1],
            darkblue: [0, 0, 139, 1],
            darkcyan: [0, 139, 139, 1],
            darkgoldenrod: [184, 134, 11, 1],
            darkgray: [169, 169, 169, 1],
            darkgreen: [0, 100, 0, 1],
            darkgrey: [169, 169, 169, 1],
            darkkhaki: [189, 183, 107, 1],
            darkmagenta: [139, 0, 139, 1],
            darkolivegreen: [85, 107, 47, 1],
            darkorange: [255, 140, 0, 1],
            darkorchid: [153, 50, 204, 1],
            darkred: [139, 0, 0, 1],
            darksalmon: [233, 150, 122, 1],
            darkseagreen: [143, 188, 143, 1],
            darkslateblue: [72, 61, 139, 1],
            darkslategray: [47, 79, 79, 1],
            darkslategrey: [47, 79, 79, 1],
            darkturquoise: [0, 206, 209, 1],
            darkviolet: [148, 0, 211, 1],
            deeppink: [255, 20, 147, 1],
            deepskyblue: [0, 191, 255, 1],
            dimgray: [105, 105, 105, 1],
            dimgrey: [105, 105, 105, 1],
            dodgerblue: [30, 144, 255, 1],
            firebrick: [178, 34, 34, 1],
            floralwhite: [255, 250, 240, 1],
            forestgreen: [34, 139, 34, 1],
            fuchsia: [255, 0, 255, 1],
            gainsboro: [220, 220, 220, 1],
            ghostwhite: [248, 248, 255, 1],
            gold: [255, 215, 0, 1],
            goldenrod: [218, 165, 32, 1],
            gray: [128, 128, 128, 1],
            green: [0, 128, 0, 1],
            greenyellow: [173, 255, 47, 1],
            grey: [128, 128, 128, 1],
            honeydew: [240, 255, 240, 1],
            hotpink: [255, 105, 180, 1],
            indianred: [205, 92, 92, 1],
            indigo: [75, 0, 130, 1],
            ivory: [255, 255, 240, 1],
            khaki: [240, 230, 140, 1],
            lavender: [230, 230, 250, 1],
            lavenderblush: [255, 240, 245, 1],
            lawngreen: [124, 252, 0, 1],
            lemonchiffon: [255, 250, 205, 1],
            lightblue: [173, 216, 230, 1],
            lightcoral: [240, 128, 128, 1],
            lightcyan: [224, 255, 255, 1],
            lightgoldenrodyellow: [250, 250, 210, 1],
            lightgray: [211, 211, 211, 1],
            lightgreen: [144, 238, 144, 1],
            lightgrey: [211, 211, 211, 1],
            lightpink: [255, 182, 193, 1],
            lightsalmon: [255, 160, 122, 1],
            lightseagreen: [32, 178, 170, 1],
            lightskyblue: [135, 206, 250, 1],
            lightslategray: [119, 136, 153, 1],
            lightslategrey: [119, 136, 153, 1],
            lightsteelblue: [176, 196, 222, 1],
            lightyellow: [255, 255, 224, 1],
            lime: [0, 255, 0, 1],
            limegreen: [50, 205, 50, 1],
            linen: [250, 240, 230, 1],
            magenta: [255, 0, 255, 1],
            maroon: [128, 0, 0, 1],
            mediumaquamarine: [102, 205, 170, 1],
            mediumblue: [0, 0, 205, 1],
            mediumorchid: [186, 85, 211, 1],
            mediumpurple: [147, 112, 219, 1],
            mediumseagreen: [60, 179, 113, 1],
            mediumslateblue: [123, 104, 238, 1],
            mediumspringgreen: [0, 250, 154, 1],
            mediumturquoise: [72, 209, 204, 1],
            mediumvioletred: [199, 21, 133, 1],
            midnightblue: [25, 25, 112, 1],
            mintcream: [245, 255, 250, 1],
            mistyrose: [255, 228, 225, 1],
            moccasin: [255, 228, 181, 1],
            navajowhite: [255, 222, 173, 1],
            navy: [0, 0, 128, 1],
            oldlace: [253, 245, 230, 1],
            olive: [128, 128, 0, 1],
            olivedrab: [107, 142, 35, 1],
            orange: [255, 165, 0, 1],
            orangered: [255, 69, 0, 1],
            orchid: [218, 112, 214, 1],
            palegoldenrod: [238, 232, 170, 1],
            palegreen: [152, 251, 152, 1],
            paleturquoise: [175, 238, 238, 1],
            palevioletred: [219, 112, 147, 1],
            papayawhip: [255, 239, 213, 1],
            peachpuff: [255, 218, 185, 1],
            peru: [205, 133, 63, 1],
            pink: [255, 192, 203, 1],
            plum: [221, 160, 221, 1],
            powderblue: [176, 224, 230, 1],
            purple: [128, 0, 128, 1],
            rebeccapurple: [102, 51, 153, 1],
            red: [255, 0, 0, 1],
            rosybrown: [188, 143, 143, 1],
            royalblue: [65, 105, 225, 1],
            saddlebrown: [139, 69, 19, 1],
            salmon: [250, 128, 114, 1],
            sandybrown: [244, 164, 96, 1],
            seagreen: [46, 139, 87, 1],
            seashell: [255, 245, 238, 1],
            sienna: [160, 82, 45, 1],
            silver: [192, 192, 192, 1],
            skyblue: [135, 206, 235, 1],
            slateblue: [106, 90, 205, 1],
            slategray: [112, 128, 144, 1],
            slategrey: [112, 128, 144, 1],
            snow: [255, 250, 250, 1],
            springgreen: [0, 255, 127, 1],
            steelblue: [70, 130, 180, 1],
            tan: [210, 180, 140, 1],
            teal: [0, 128, 128, 1],
            thistle: [216, 191, 216, 1],
            tomato: [255, 99, 71, 1],
            turquoise: [64, 224, 208, 1],
            violet: [238, 130, 238, 1],
            wheat: [245, 222, 179, 1],
            white: [255, 255, 255, 1],
            whitesmoke: [245, 245, 245, 1],
            yellow: [255, 255, 0, 1],
            yellowgreen: [154, 205, 50, 1]
            // Add more named colors as needed
        };
        if (colorNames[computed]) {
            return colorNames[computed.toLowerCase()];
        }

        return null;
    }

    return instance as TSQuery;
}

export default $
