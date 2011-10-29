class ContestsController < ApplicationController
  def index
    @contests = Contest.all
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
    $redis.hset("active_contests:#{current_user.id}", contest.id, MultiJson.encode(contest.attributes.slice("id","title")))
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
    @contest = Contest.find params[:id]
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
    contest = Contest.find params[:contestToken]
    if contest
      entry = current_user.entries.build(:contest_id => contest.id, :content => params[:content])
      if entry.save
        # add contests to Active_contests 
        $redis.hset("active_contests:#{current_user.id}", contest.id, MultiJson.encode(contest.attributes.slice("id","title")))
        # send notification to the contest's user
        hash = {}
        hash[:created_at] = Time.now
        hash[:type] = "entry"
        hash[:user_id] = contest.user.id
        hash[:username] = contest.user.username
        hash[:contest_id] = contest.id
        hash[:contest_title] = contest.title
        $redis.incr("notifications:#{contest.user.id}:unreadcount");
        $redis.lpush("notifications:#{contest.user.id}", MultiJson.encode(hash))
        Pusher["presence-notifications_#{contest.user.id}"].trigger('notification_created', MultiJson.encode(hash))
        render :json => {:rc => 0}
      else
        render :json => {:rc => 2, :msg => "ai you!"}
      end
    end
  end
  
  def active_contests
    @active_contest_list = $redis.hvals("active_contests:#{current_user.id}")
    @active_contest_list.collect! { |active_contest| MultiJson.decode(active_contest) }
  end
  
  def load_active_contests
    active_contest_list = $redis.lrange("active_contests:#{current_user.id}", 0, -1)
    active_contest_list.collect! { |active_contest| MultiJson.decode(active_contest) }
    active_count = $redis.get("active_contests:#{current_user.id}:count")
    render :json => { :count => active_count, :active_contests => active_contest_list, :rc => 0 }
  end
end
