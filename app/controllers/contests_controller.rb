class ContestsController < ApplicationController
  def index
    
  end
  
  def new
    
  end
  
  def create
    
  end
  
  def show
    
  end
  
  def check_credits
    render :json => {:need_credit => params[:prize], :used_credit => current_user.credits}
  end
end
