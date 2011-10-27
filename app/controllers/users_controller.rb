class UsersController < ApplicationController
  def show
    if @user = User.find_by_id(params[:id])
      @profile = @user.profile
      @is_myself = (@user.id == current_user.id)
    else
      
    end
  end

end
