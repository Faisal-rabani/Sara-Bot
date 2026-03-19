"""
Pure Python math calculation engine
No AI involved - instant calculations for math expressions
"""

import math
import re

def is_math_expression(text):
    """Check if text is a math expression"""
    text = text.lower().strip()
    math_keywords = ['sqrt', 'square root', 'percent', '%', 'power', '^', 'to the power']
    
    if any(keyword in text for keyword in math_keywords):
        return True
    
    if re.match(r'^[\d\s\+\-\*\/\(\)\.\^]+$', text):
        return True
    
    return False

def calculate_math(expression):
    """Calculate math expression and return result"""
    try:
        expression = expression.lower().strip()
        
        # Percentage calculation
        if 'percent' in expression or '%' in expression:
            match = re.search(r'(\d+\.?\d*)\s*(?:percent|%)\s*(?:of)?\s*(\d+\.?\d*)', expression)
            if match:
                percent = float(match.group(1))
                value = float(match.group(2))
                result = (percent / 100) * value
                return f"{expression} = {result}"
        
        # Square root calculation
        if 'sqrt' in expression or 'square root' in expression:
            match = re.search(r'(?:sqrt|square root)\s*(?:of)?\s*(\d+\.?\d*)', expression)
            if match:
                value = float(match.group(1))
                result = math.sqrt(value)
                return f"sqrt({value}) = {result}"
        
        # Power calculation
        if 'power' in expression or '^' in expression:
            match = re.search(r'(\d+\.?\d*)\s*(?:to the )?power\s*(\d+\.?\d*)', expression)
            if match:
                base = float(match.group(1))
                exp = float(match.group(2))
                result = base ** exp
                return f"{base} to the power {exp} = {result}"
            
            match = re.search(r'(\d+\.?\d*)\^(\d+\.?\d*)', expression)
            if match:
                base = float(match.group(1))
                exp = float(match.group(2))
                result = base ** exp
                return f"{base}^{exp} = {result}"
        
        # Basic arithmetic
        result = eval(expression)
        return f"{expression} = {result}"
    
    except:
        return None
