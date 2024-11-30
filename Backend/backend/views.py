from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import os
import google.generativeai as genai
from dotenv import load_dotenv


#load .env
def start():
    load_dotenv()
    # Ensure the GOOGLE_API_KEY environment variable is set
    if not os.getenv('GOOGLE_API_KEY'):
        raise ValueError("GOOGLE_API_KEY not set in .env file")

# Create your views here.
@require_http_methods(["GET"])
def load(request):
    start()
    category = request.GET.get('category')
    question = ""

    # Set up the API key
    genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

    # Set up the model
    model = genai.GenerativeModel('gemini-pro')

    # Prepare the prompt
    create_category_prompt = f"""
    The category is {category}. Ask me to name anything related to the category. This could a name, concept, or something related to it. Below are some examples, which may or not be related to the category. 

    For example: 
    Name one united states president. 

    Another example: 
    Name one Taylor Swift album.
   
    
    Please don't do generic questions. However, don't be too creative. Just don't try to repeat alot.
    """

    

    max_attempts = 3
    for attempt in range(max_attempts):
        try:
            # Generate category
            response = model.generate_content(create_category_prompt)

            # Check if category is a single sentence
            response_text = response.text.strip()
            sentence_count = len([s for s in response_text.split('.') if s.strip()])
            
            if sentence_count == 1:
                question = response_text
            else:
                raise Exception()
            answer_prompt = f"""
            {question} Only write your answer, no other words
            """
            
            # Generate answer
            print(answer_prompt)
            response = model.generate_content(answer_prompt)

            # Remove punctuation from the answer
            #answer = response.text.strip()
            #answer = ''.join(char for char in answer if char.isalnum() or char.isspace())


            # return question and answer
            return JsonResponse({'question': question, 'answer': response.text})

        except Exception as e:
            print(f"Attempt {attempt + 1}: Error occurred: {str(e)}. Retrying...")

    return JsonResponse({'error': 'Failed to generate response after maximum attempts'}, status=500)
    

@require_http_methods(["GET"])
def submit(request):
    start()
    question = request.GET.get('question')
    userAnswer = request.GET.get('userAnswer')
    AIAnswer = request.GET.get('AIAnswer')

    # Set up the API key
    genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

    # Set up the model
    model = genai.GenerativeModel('gemini-pro')

   
    max_attempts = 3
    for attempt in range(max_attempts):
        try:
            check_answer_prompt = f"""
            is {userAnswer} an answer to this question, or very very close to being the answer to this question: {question}. 
            Be triple, triple, sure that you check the newest sources to make sure answers are not marked as invalid when they are valid! 
            Only respond with yes or no, no other words please!
   
            """
           
            # Check if user answer is valid
            response = model.generate_content(check_answer_prompt)
            
            # Remove punctuation and check for yes/no
            response_text = ''.join(char for char in response.text.strip() if char.isalnum() or char.isspace())
            response_text = response_text.lower()
            
            if response_text == 'yes' or response_text == 'no':
                isAnswerResponse = response_text
            else:
                raise Exception()
            
            if isAnswerResponse == 'no':
                 return JsonResponse({'isUserAnswerValid': False, 'isMatching': False})
            
            
            check_identical_prompt = f"""
            Are these two answers: “{userAnswer}” AND “{AIAnswer}”, the same response to this question: {question}. 
            If the two answers are identical except for typos, then consider them the same. 
            You keep considering different answers (ex. brutal and Good 4 u) as the same! Please avoid this at all costs!!!!
            If the two answers do not match, then they are not the same!
            Only respond with yes or no please! 
            """
            # Check if user and AI answer are identical
            response = model.generate_content(check_identical_prompt)

            # Remove punctuation and check for yes/no
            response_text = ''.join(char for char in response.text.strip() if char.isalnum() or char.isspace())
            response_text = response_text.lower()
            
            if response_text == 'yes' or response_text == 'no':
                isMatchingResponse = response_text
            else:
                raise Exception()
            if isMatchingResponse == 'yes':
                 return JsonResponse({'isUserAnswerValid': True, 'isMatching': True})
            else:
                return JsonResponse({'isUserAnswerValid': True, 'isMatching': False})

        except Exception as e:
            print(f"Attempt {attempt + 1}: Error occurred: {str(e)}. Retrying...")

    return JsonResponse({'error': 'Failed to generate response after maximum attempts'}, status=500)
