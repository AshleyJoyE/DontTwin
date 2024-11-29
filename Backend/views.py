from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import os
import google.generativeai as genai
from dotenv import load_dotenv


#load .env
def start():
    load_dotenv()
    # Ensure the GOOGLE_CLOUD_PROJECT environment variable is set
    if not os.getenv('GOOGLE_CLOUD_PROJECT'):
        raise ValueError("GOOGLE_CLOUD_PROJECT not set in .env file")

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
   
    """

    answer_prompt = f"""
    {question} Only write your answer, no other words
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
            
            # Generate answer
            response = model.generate_content(answer_prompt)

            # Remove punctuation from the answer
            answer = response.text.strip()
            answer = ''.join(char for char in answer if char.isalnum() or char.isspace())


            # return question and answer
            return JsonResponse({'question': question, 'answer': answer})

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

    # Prepare the prompt
    check_answer_prompt = f"""
    is {userAnswer} an answer to this question: {question}. Only respond with your answer, no other words please!
   
    """

    check_identical_prompt = f"""
    Are these two answers: “{userAnswer}” AND “{AIAnswer}”, the same response to this question: {question}. If the two answers are identical except for typos or simple words, then consider them the same.
    """

    max_attempts = 3
    for attempt in range(max_attempts):
        try:
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
