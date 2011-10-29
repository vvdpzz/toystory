class ContestsController < ApplicationController
  def index
    
  end
  
  def new
    
  end

  def create
    contest = Contest.new(
      :user_id         => current_user.id,
      :title           => params[:title],
      :content         => params[:content],
      :rules_list      => params[:rules_list],
      :customized_rule => params[:customized_rule],
      :credits         => params[:credits],
      :end_date        => params[:end_date],
      :is_community    => params[:is_community]
    )
    
    # add to Active Contests HASH
    $redis.rpush("active_contests:#{current_user.id}", MultiJson.encode(contest.attributes.slice("id","title")))
    $redis.incr("active_contests:#{current_user.id}:count")
    
    # not a just for fun contest
    if contest.is_community == 0
      diff = contest.credits - current_user.credits
      # do not have enough credits to pay
      if diff > 0
        render :json => {:rc => 2, :diff => diff}
        return
      else
        # do some deduct
      end
    end
    
    if contest.save
      # save successed
      render :json => {:rc => 0, :next => "/contests/#{contest.id}"}
    else
      # failed, return error messages
      render :json => {:rc => 1, :msg => "Some errors happens."}
    end
  end
  
  def show
    
  end
  
  def check_credits
    need_credit = params[:prize].to_f - current_user.credits
    need_credit = 0 if need_credit < 0
    used_credit = current_user.credits
    prize = params[:prize].to_f
    used_credit = current_user.credits > prize ? prize : current_user.credits
    render :json => {:need_credit => need_credit, :used_credit => used_credit}
  end
  
  def add_entry
    # TODO: add contests to Active_contests
  end
  
  def active_contests
    @active_contest_list = $redis.lrange("active_contests:#{current_user.id}", 0, -1)
    @active_contest_list.collect! { |active_contest| MultiJson.decode(active_contest) }
  end
  
  def load_active_contests
    active_contest_list = $redis.lrange("active_contests:#{current_user.id}", 0, -1)
    active_contest_list.collect! { |active_contest| MultiJson.decode(active_contest) }
    active_count = $redis.get("active_contests:#{current_user.id}:count")
    render :json => { :count => active_count, :active_contests => active_contest_list, :rc => 0 }
  end
end
