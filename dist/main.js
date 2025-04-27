"use strict";
// Safe querySelectorAll function with error handling
function safeQuerySelectorAll(selector) {
    try {
        return Array.from(document.querySelectorAll(selector));
    }
    catch (e) {
        const error = e;
        throw new Error(`EQuery Error: Failed to parse selector "${selector}".\nReason: ${error.message}`);
    }
}
// The main $ function, which mimics jQuery's basic DOM manipulation behavior
function $(selector) {
    let elements;
    // If selector is a string, use querySelectorAll to find elements
    if (typeof selector === 'string') {
        elements = safeQuerySelectorAll(selector);
    }
    else if (selector instanceof HTMLElement) {
        // If it's a single HTMLElement, wrap it in an array
        elements = [selector];
    }
    else if (Array.isArray(selector)) {
        // If it's an array of HTMLElements, use it directly
        elements = selector;
    }
    else {
        throw new Error(`EQuery Error: Invalid selector type. Expected string, HTMLElement, or HTMLElement[].`);
    }
    // Create the EQuery instance with the methods for DOM manipulation
    const instance = {
        elements,
        // forEach method to iterate over elements and execute the callback
        forEach(callback) {
            this.elements.forEach(callback);
        },
        // each method that allows chaining, iterates over elements
        each(callback) {
            this.elements.forEach((el, index) => callback(el, index));
            return this;
        },
        // css method to set CSS styles, either a single property or multiple properties
        css(propertyOrProperties, value) {
            if (typeof propertyOrProperties === 'string') {
                // If a single CSS property is provided
                this.elements.forEach((el) => {
                    el.style[propertyOrProperties] = value;
                });
            }
            else {
                // If multiple CSS properties are provided
                for (const prop in propertyOrProperties) {
                    const val = propertyOrProperties[prop];
                    this.elements.forEach((el) => {
                        el.style[prop] = val;
                    });
                }
            }
            return this;
        },
        // addClass method to add a class to selected elements
        addClass(className) {
            this.elements.forEach((el) => el.classList.add(className));
            return this;
        },
        // removeClass method to remove a class from selected elements
        removeClass(className) {
            this.elements.forEach((el) => el.classList.remove(className));
            return this;
        },
        // setAttr method to set an attribute on selected elements
        setAttr(name, value) {
            this.elements.forEach((el) => el.setAttribute(name, value));
            return this;
        },
        // getAttr method to retrieve the value of an attribute from the first element
        getAttr(name) {
            var _a;
            return ((_a = this.elements[0]) === null || _a === void 0 ? void 0 : _a.getAttribute(name)) || '';
        },
        // html method to get or set the innerHTML of selected elements
        html(htmlString) {
            var _a;
            if (htmlString === undefined) {
                return ((_a = this.elements[0]) === null || _a === void 0 ? void 0 : _a.innerHTML) || '';
            }
            this.elements.forEach((el) => el.innerHTML = htmlString);
            return this;
        },
        // on method to attach event listeners to elements, with event delegation support
        on(events, selectorOrHandler, handlerOrOptions, options) {
            const eventList = events.split(/\s+/);
            if (typeof selectorOrHandler === 'function') {
                this.forEach((el) => {
                    eventList.forEach(event => {
                        // Attach event listener directly
                        el.addEventListener(event, function (e) {
                            const clickedElement = e.target;
                            selectorOrHandler.call(clickedElement, e);
                        }.bind(this), handlerOrOptions);
                    });
                });
            }
            else if (typeof selectorOrHandler === 'string' && typeof handlerOrOptions === 'function') {
                // Delegate events to elements matching the selector
                this.forEach((el) => {
                    eventList.forEach(event => {
                        el.addEventListener(event, function (e) {
                            const target = e.target;
                            if (target && target.matches(selectorOrHandler)) {
                                handlerOrOptions.call(target, e);
                            }
                        }.bind(this), options);
                    });
                });
            }
            return this;
        },
        // find method to search for child elements that match a given selector
        find(selector) {
            const foundElements = [];
            this.elements.forEach((el) => {
                foundElements.push(...Array.from(el.querySelectorAll(selector)));
            });
            return $(foundElements);
        },
        // children method to get child elements of selected elements
        children() {
            const childElements = [];
            this.elements.forEach((el) => {
                Array.from(el.children).forEach((child) => {
                    childElements.push(child);
                });
            });
            return $(childElements);
        },
        // parent method to get the parent of each selected element
        parent() {
            const parentElements = [];
            this.elements.forEach((el) => {
                const parent = el.parentElement;
                if (parent && parent instanceof HTMLElement) {
                    parentElements.push(parent);
                }
            });
            return $(parentElements);
        },
        // parents method to get ancestors of each selected element
        parents(selector) {
            const parentElements = [];
            this.elements.forEach((el) => {
                let parent = el.parentElement;
                while (parent) {
                    if (parent instanceof HTMLElement) {
                        // If a selector is provided, check if the parent matches it
                        if (selector && parent.matches(selector)) {
                            parentElements.push(parent);
                            break;
                        }
                        else if (!selector) {
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
        siblings(selector) {
            const siblingElements = [];
            this.elements.forEach((el) => {
                const parent = el.parentElement;
                if (parent) {
                    Array.from(parent.children).forEach((sibling) => {
                        if (sibling !== el && sibling instanceof HTMLElement) {
                            if (selector && sibling.matches(selector)) {
                                siblingElements.push(sibling);
                            }
                            else if (!selector) {
                                siblingElements.push(sibling);
                            }
                        }
                    });
                }
            });
            return $(siblingElements);
        },
        // next method to get the next sibling of each selected element
        next(selector) {
            const nextElements = [];
            this.elements.forEach((el) => {
                let nextSibling = el.nextElementSibling;
                while (nextSibling) {
                    if (nextSibling instanceof HTMLElement) {
                        if (selector && nextSibling.matches(selector)) {
                            nextElements.push(nextSibling);
                            break;
                        }
                        else if (!selector) {
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
        prev(selector) {
            const prevElements = [];
            this.elements.forEach((el) => {
                let prevSibling = el.previousElementSibling;
                while (prevSibling) {
                    if (prevSibling instanceof HTMLElement) {
                        if (selector && prevSibling.matches(selector)) {
                            prevElements.push(prevSibling);
                            break;
                        }
                        else if (!selector) {
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
        closest(selector) {
            const closestElements = [];
            this.elements.forEach((el) => {
                let parent = el; // Start from the element itself
                // Traverse up the ancestors
                while (parent) {
                    if (parent.matches(selector)) {
                        closestElements.push(parent);
                        break; // Stop at the first matching ancestor
                    }
                    parent = parent.parentElement; // Move to the parent element
                }
            });
            return $(closestElements); // Return EQuery instance with matched ancestors
        },
        // first method to get the first element of each selected element
        first(selector) {
            const firstElements = this.elements.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children);
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;
                // Return the first filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[0] : null;
            }).filter(Boolean);
            return $(firstElements);
        },
        // last method to get the last element of each selected element
        last(selector) {
            const lastElements = this.elements.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children);
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;
                // Return the last filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[filteredChildren.length - 1] : null;
            }).filter(Boolean);
            return $(lastElements);
        },
        // has method to check whether a specific element is a descendant of any of the selected elements
        has(selector) {
            const filteredElements = this.elements.filter((el) => {
                // Check if the element contains the selector
                return el.querySelector(selector) !== null;
            });
            return $(filteredElements);
        },
        // Filter method to  filter out elements from a collection based on a provided condition or function
        filter(callback) {
            const filteredElements = this.elements.filter((el, index) => {
                // Apply the callback function to each element
                return callback(el, index);
            });
            return $(filteredElements);
        },
        // Filter method to get an element at a specific index in the current collection of elements
        eq(index) {
            // Ensure index is within the bounds of the elements array
            const element = this.elements[index >= 0 ? index : this.elements.length + index];
            // Return a new EQuery instance with a single element at the specified index
            return $(element ? [element] : []);
        },
        // Filter method to exclude certain elements from the set of selected elements
        not(selector) {
            let filteredElements;
            if (typeof selector === 'string') {
                // Filter out elements that match the given selector
                filteredElements = this.elements.filter(el => !el.matches(selector));
            }
            else if (typeof selector === 'function') {
                // Filter out elements that return true from the callback function
                filteredElements = this.elements.filter(el => !selector(el));
            }
            else {
                filteredElements = [];
            }
            return $(filteredElements);
        },
    };
    return instance;
}
